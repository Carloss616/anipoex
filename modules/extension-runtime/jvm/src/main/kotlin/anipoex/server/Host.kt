package anipoex.server

import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.int
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import java.util.Base64

/** What the app around the runtime does for it, where the JVM can't: the desktop's sidecar loop and iOS's JNI host set it. */
object Host {
    /**
     * Solves a Cloudflare challenge at a URL in a real browser and returns the cookies it earned
     * for it, as `Set-Cookie` values, and the user agent it solved as. Blocks; null when the host can't.
     */
    @Volatile
    var solveChallenge: ((url: String) -> Solution)? = null

    /**
     * Sends a request through that browser's own network stack, with its cookies: some sites tie
     * the clearance to the browser's TLS fingerprint, which the JVM's doesn't match. Follows redirects.
     */
    @Volatile
    var fetch: ((HostRequest) -> HostResponse)? = null

    /** The JSON call into the app itself, for what has no typed wrapper here (the JavaScript engine). */
    @Volatile
    var call: ((method: String, args: JsonObject) -> JsonElement)? = null

    /**
     * The user agent the app's browser holds a site's clearance or session under, by host: a solved challenge, or a
     * WebView page that ran as another browser than the extension asked for. That host's requests (and its subdomains')
     * go out with it, so the site sees one browser.
     */
    val browserUserAgents = java.util.concurrent.ConcurrentHashMap<String, String>()

    /** [browserUserAgents]' entry for [host] or the closest domain above it. */
    fun browserUserAgent(host: String): String? =
        generateSequence(host) { it.substringAfter('.', "").takeIf(String::isNotEmpty) }.firstNotNullOfOrNull(browserUserAgents::get)

    /** The clearance only holds for the user agent that earned it, so requests to that host send it after. */
    class Solution(val cookies: List<String>, val userAgent: String)

    class HostRequest(val method: String, val url: String, val headers: List<Pair<String, String>>, val body: ByteArray?)

    class HostResponse(val code: Int, val headers: List<Pair<String, String>>, val body: ByteArray)

    /**
     * Wires both through one JSON call into the app, as the desktop's protocol and iOS's JNI do:
     * `solveChallenge {url}` answers `{cookies, userAgent}`; `fetch {method, url, headers, body}`
     * answers `{status, headers, body}`, headers as `[name, value]` pairs and bodies in base64.
     */
    fun overJson(call: (method: String, args: JsonObject) -> JsonElement) {
        this.call = call
        solveChallenge = { url ->
            val solution = call("solveChallenge", JsonObject(mapOf("url" to JsonPrimitive(url)))).jsonObject
            Solution(
                solution.getValue("cookies").jsonArray.mapNotNull { it.jsonPrimitive.contentOrNull },
                solution.getValue("userAgent").jsonPrimitive.content,
            )
        }
        fetch = { request ->
            val args = mapOf(
                "method" to JsonPrimitive(request.method),
                "url" to JsonPrimitive(request.url),
                "headers" to JsonArray(request.headers.map { (name, value) -> JsonArray(listOf(JsonPrimitive(name), JsonPrimitive(value))) }),
                "body" to (request.body?.let { JsonPrimitive(Base64.getEncoder().encodeToString(it)) } ?: JsonNull),
            )
            val reply = call("fetch", JsonObject(args)).jsonObject
            HostResponse(
                reply.getValue("status").jsonPrimitive.int,
                reply.getValue("headers").jsonArray.map { it.jsonArray[0].jsonPrimitive.content to it.jsonArray[1].jsonPrimitive.content },
                Base64.getDecoder().decode(reply.getValue("body").jsonPrimitive.content),
            )
        }
    }
}
