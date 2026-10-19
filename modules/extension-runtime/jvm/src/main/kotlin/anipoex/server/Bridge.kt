package anipoex.server

import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.int
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import java.io.File
import java.lang.reflect.InvocationTargetException

/**
 * The one entry point every host calls (JNI on iOS, the stdin/stdout loop on desktop): JSON args in, `{"result":…}` or `{"error":…}` out.
 * Blocks the calling thread, so hosts call it off their UI thread.
 */
object Bridge {
    @Volatile private var host: ExtensionHost? = null

    /** Forgets the host so tests can start from an uninitialized bridge. */
    internal fun reset() { host = null }

    @JvmStatic
    fun call(method: String, args: String): String = try {
        val result = runBlocking { dispatch(method, Json.parseToJsonElement(args).jsonObject) }
        JsonObject(mapOf("result" to toJson(result))).toString()
    } catch (e: Throwable) {
        // A constructor that throws arrives wrapped; the cause is what the app should show.
        val cause = if (e is InvocationTargetException) e.cause ?: e else e
        cause.printStackTrace()
        JsonObject(mapOf("error" to JsonPrimitive(cause.message ?: cause.toString()))).toString()
    }

    private suspend fun dispatch(method: String, args: JsonObject): Any? {
        fun string(name: String) = args.getValue(name).jsonPrimitive.content
        fun int(name: String) = args.getValue(name).jsonPrimitive.int
        if (method == "init") {
            synchronized(this) { if (host == null) host = ExtensionHost(File(string("dataDir"))) }
            return null
        }
        val host = checkNotNull(host) { "Call init first" }
        return when (method) {
            "install" -> host.install(string("apkUrl"), string("signingKey"))
            "installed" -> host.installed()
            "uninstall" -> host.uninstall(string("pkg"))
            "popular" -> host.popular(string("sourceId"), int("page"))
            "search" -> host.search(string("sourceId"), string("query"), int("page"))
            "chapters" -> host.chapters(string("sourceId"), string("mangaUrl"), string("title"))
            "mangaWebUrl" -> host.mangaWebUrl(string("sourceId"), string("mangaUrl"))
            "pages" -> host.pages(string("sourceId"), string("chapterUrl"))
            else -> error("Unknown method $method")
        }
    }

    private fun toJson(value: Any?): JsonElement = when (value) {
        null, is Unit -> JsonNull
        is JsonElement -> value
        is String -> JsonPrimitive(value)
        is Number -> JsonPrimitive(value)
        is Boolean -> JsonPrimitive(value)
        is Map<*, *> -> JsonObject(value.entries.associate { it.key.toString() to toJson(it.value) })
        is Iterable<*> -> JsonArray(value.map(::toJson))
        else -> JsonPrimitive(value.toString())
    }
}
