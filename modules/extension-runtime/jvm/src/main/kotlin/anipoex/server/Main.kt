package anipoex.server

import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import java.io.FileDescriptor
import java.io.FileOutputStream
import java.io.PrintStream
import java.util.concurrent.CompletableFuture
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicLong
import kotlin.system.exitProcess

/**
 * Desktop sidecar (`extension-runtime <dataDir>`): one JSON request per stdin line `{"id","method","args"}`, one response per stdout line `{"id","result"|"error"}`.
 * The other way, the runtime asks the app with a stdout line `{"host","id","args"}` and the app answers on stdin `{"hostReply","result"|"error"}`.
 */
fun main(args: Array<String>) {
    // stdout carries the protocol only, so a println from an extension or library lands on stderr.
    val protocol = PrintStream(FileOutputStream(FileDescriptor.out), true, Charsets.UTF_8)
    System.setOut(System.err)
    Bridge.call("init", JsonObject(mapOf("dataDir" to kotlinx.serialization.json.JsonPrimitive(args.first()))).toString())

    val hostCalls = HostCalls { line -> synchronized(protocol) { protocol.println(line) } }
    Host.overJson(hostCalls::call)

    // Requests run concurrently: the app searches several sources at once and each call blocks its thread.
    val pool = Executors.newCachedThreadPool()
    System.`in`.bufferedReader().lineSequence().filter { it.isNotBlank() }.forEach { line ->
        // A host reply wakes the request waiting on it, which holds a pool thread.
        if (hostCalls.answer(line)) return@forEach
        pool.execute {
            val response = handleLine(line)
            synchronized(protocol) { protocol.println(response) }
        }
    }
    // stdin closed: the app is gone, so in-flight requests get a few seconds and nobody reads what they'd answer.
    pool.shutdown()
    pool.awaitTermination(5, TimeUnit.SECONDS)
    // Library threads (OkHttp, coroutines) would keep the VM alive.
    exitProcess(0)
}

/** Answers one request line with one response line; a line that isn't a request gets `"id":null` and a `Bad request` error. */
fun handleLine(line: String): String = try {
    val request = Json.parseToJsonElement(line).jsonObject
    val reply = Json.parseToJsonElement(Bridge.call(request.getValue("method").jsonPrimitive.content, (request["args"] ?: JsonObject(emptyMap())).toString())).jsonObject
    JsonObject(mapOf("id" to (request["id"] ?: JsonNull)) + reply).toString()
} catch (e: Exception) {
    JsonObject(mapOf("id" to JsonNull, "error" to kotlinx.serialization.json.JsonPrimitive("Bad request: ${e.message}"))).toString()
}

/** Calls into the app over the protocol: each call writes a `{"host"}` line and blocks until its `{"hostReply"}` comes back on stdin. */
class HostCalls(private val write: (String) -> Unit) {
    private val nextId = AtomicLong()
    private val waiting = ConcurrentHashMap<Long, CompletableFuture<JsonElement>>()

    fun call(method: String, args: JsonObject): JsonElement {
        val id = nextId.incrementAndGet()
        val reply = CompletableFuture<JsonElement>()
        waiting[id] = reply
        write(JsonObject(mapOf("host" to JsonPrimitive(method), "id" to JsonPrimitive(id), "args" to args)).toString())
        try {
            // A challenge a person has to solve can take a while; past this the app is gone or stuck.
            return reply.get(2, TimeUnit.MINUTES)
        } catch (e: java.util.concurrent.ExecutionException) {
            throw e.cause ?: e
        } finally {
            waiting.remove(id)
        }
    }

    /** Completes the call a `{"hostReply"}` line answers; false for any other line. */
    fun answer(line: String): Boolean {
        val reply = runCatching { Json.parseToJsonElement(line).jsonObject }.getOrNull() ?: return false
        val id = reply["hostReply"]?.jsonPrimitive?.contentOrNull?.toLongOrNull() ?: return false
        val error = reply["error"]?.jsonPrimitive?.contentOrNull
        val pending = waiting[id] ?: return true
        if (error != null) pending.completeExceptionally(IllegalStateException(error)) else pending.complete(reply["result"] ?: JsonNull)
        return true
    }
}
