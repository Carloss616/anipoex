package anipoex.server

import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import java.io.FileDescriptor
import java.io.FileOutputStream
import java.io.PrintStream
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import kotlin.system.exitProcess

/** Desktop sidecar (`extension-runtime <dataDir>`): one JSON request per stdin line `{"id","method","args"}`, one response per stdout line `{"id","result"|"error"}`. */
fun main(args: Array<String>) {
    // stdout carries the protocol only, so a println from an extension or library lands on stderr.
    val protocol = PrintStream(FileOutputStream(FileDescriptor.out), true, Charsets.UTF_8)
    System.setOut(System.err)
    Bridge.call("init", JsonObject(mapOf("dataDir" to kotlinx.serialization.json.JsonPrimitive(args.first()))).toString())

    // Requests run concurrently: the app searches several sources at once and each call blocks its thread.
    val pool = Executors.newCachedThreadPool()
    System.`in`.bufferedReader().lineSequence().filter { it.isNotBlank() }.forEach { line ->
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
