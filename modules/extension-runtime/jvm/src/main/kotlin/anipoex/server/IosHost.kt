package anipoex.server

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

/** iOS's side of [Host]: JvmHost.m registers [call] as a native method backed by a WKWebView, then calls [install]. */
object IosHost {
    /** Answers `{"result"}` or `{"error"}`, as the desktop's host replies do. */
    @JvmStatic
    external fun call(method: String, argsJson: String): String

    @JvmStatic
    fun install() {
        Host.overJson { method, args ->
            val reply = Json.parseToJsonElement(call(method, args.toString())).jsonObject
            reply["error"]?.let { error(it.jsonPrimitive.content) }
            reply.getValue("result")
        }
    }
}
