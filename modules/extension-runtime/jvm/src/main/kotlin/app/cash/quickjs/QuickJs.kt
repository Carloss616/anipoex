package app.cash.quickjs

import anipoex.server.Host
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.double
import java.io.Closeable

/**
 * Mihon's QuickJS API, run by the app's own engine through [Host] (V8 on desktop, JavaScriptCore on iOS):
 * QuickJS's native library can't load on this runtime, and the pure-Java engines don't parse modern
 * scripts. Results come back as QuickJS gives them: String, Integer, Double, Boolean, Object[] for
 * arrays, null otherwise.
 * @see https://github.com/zhanghai/quickjs-java
 */
class QuickJs private constructor(private val id: JsonElement) : Closeable {
    @Volatile
    private var closed = false

    fun evaluate(script: String): Any? = evaluate(script, "?")

    @Suppress("UNUSED_PARAMETER")
    fun evaluate(script: String, fileName: String): Any? {
        check(!closed) { "QuickJs is closed" }
        return toJava(call("jsEvaluate", JsonObject(mapOf("id" to id, "script" to JsonPrimitive(script)))))
    }

    // shortcut: the "bytecode" is the source itself; enough for extensions that compile once and execute.
    @Suppress("UNUSED_PARAMETER")
    fun compile(sourceCode: String, fileName: String): ByteArray = sourceCode.toByteArray()

    fun execute(bytecode: ByteArray): Any? = evaluate(String(bytecode))

    override fun close() {
        if (closed) return
        closed = true
        runCatching { call("jsClose", JsonObject(mapOf("id" to id))) }
    }

    companion object {
        @JvmStatic
        fun create(): QuickJs = QuickJs(call("jsCreate", JsonObject(emptyMap())))

        private fun call(method: String, args: JsonObject): JsonElement {
            val host = Host.call ?: throw QuickJsException("This app has no JavaScript engine")
            return try {
                host(method, args)
            } catch (e: Exception) {
                throw QuickJsException(e.message ?: "The script failed")
            }
        }

        private fun toJava(value: JsonElement): Any? = when (value) {
            is JsonNull -> null
            is JsonArray -> value.map(::toJava).toTypedArray()
            is JsonPrimitive -> when {
                value.isString -> value.content
                value.booleanOrNull != null -> value.booleanOrNull
                // QuickJS keeps whole numbers as ints.
                else -> value.double.let { if (it == Math.rint(it) && it in Int.MIN_VALUE.toDouble()..Int.MAX_VALUE.toDouble()) it.toInt() else it }
            }
            else -> null
        }
    }
}

/** A script's error, as QuickJS reports it. */
class QuickJsException(message: String) : RuntimeException(message)
