package android.webkit

import android.content.Context
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.ViewGroup
import anipoex.server.Host
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonObjectBuilder
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.boolean
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import okhttp3.Cookie
import java.lang.reflect.Method
import java.util.Base64
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.concurrent.thread

private const val TAG = "WebView"

/**
 * Android's WebView over the app's browser (desktop: a hidden window; iOS: an offscreen WKWebView), driven through
 * [Host] with the `wv*` calls: `wvCreate`, `wvLoad`/`wvLoadData` (each with the settings and every CookieManager
 * cookie), `wvEvaluate`, `wvStop`, `wvDestroy`, and `wvRespond` for an intercepted request. The page's side comes
 * back through `wvEvents`, which one daemon thread per view long-polls until the page is closed; cookies the browser
 * gains come with `pageFinished` and in `cookies` events, into the CookieManager every source shares.
 */
open class WebView(context: Context?) : ViewGroup(context) {
    private val id: JsonElement
    val settings: WebSettings
    var webViewClient = WebViewClient()
    var webChromeClient: WebChromeClient? = null

    private val interfaces = ConcurrentHashMap<String, Any>()
    private val destroyed = AtomicBoolean(false)

    // One at a time, so scripts run in the order they were sent, as Android runs them.
    private val evaluator = Executors.newSingleThreadExecutor { Thread(it, "webview-evaluate").apply { isDaemon = true } }

    init {
        val created = call("wvCreate", JsonObject(emptyMap())).jsonObject
        id = created.getValue("id")
        settings = WebSettings(created.getValue("userAgent").jsonPrimitive.content)
        thread(isDaemon = true, name = "webview-events-$id") { poll() }
    }

    fun loadUrl(url: String, additionalHttpHeaders: Map<String, String>) {
        if (destroyed.get()) return
        // Android runs a `javascript:` URL in the current page, as a browser does (percent-escapes decoded).
        if (url.startsWith("javascript:", ignoreCase = true)) return evaluateJavascript(Uri.decode(url.substring(11)), null)
        call("wvLoad", page { put("url", url); put("headers", strings(additionalHttpHeaders)) })
    }

    fun loadUrl(url: String) = loadUrl(url, emptyMap())

    @Suppress("UNUSED_PARAMETER")
    fun loadDataWithBaseURL(baseUrl: String?, data: String, mimeType: String?, encoding: String?, historyUrl: String?) {
        if (destroyed.get()) return
        call(
            "wvLoadData",
            page {
                put("baseUrl", baseUrl ?: "about:blank")
                put("data", data)
                put("mimeType", mimeType ?: "text/html")
                put("encoding", encoding ?: "UTF-8")
            },
        )
    }

    /** Runs off the main thread, since the browser answers when the script is done; [resultCallback] gets it on the main one. */
    fun evaluateJavascript(script: String, resultCallback: ValueCallback<String>?) {
        if (destroyed.get()) return
        evaluator.execute {
            val value = runCatching { call("wvEvaluate", buildJsonObject { put("id", id); put("script", script) }).jsonPrimitive.content }
                .getOrElse { Log.w(TAG, "evaluateJavascript failed", it); "null" }
            if (resultCallback != null) onMain { resultCallback.onReceiveValue(value) }
        }
    }

    /** Takes effect from the next load, as on Android. */
    fun addJavascriptInterface(obj: Any, name: String) {
        interfaces[name] = obj
    }

    fun postVisualStateCallback(requestId: Long, callback: VisualStateCallback) = onMain { callback.onComplete(requestId) }

    fun stopLoading() {
        if (destroyed.get()) return
        runCatching { call("wvStop", buildJsonObject { put("id", id) }) }.onFailure { Log.w(TAG, "stopLoading failed", it) }
    }

    fun destroy() {
        if (destroyed.getAndSet(true)) return
        evaluator.shutdown()
        runCatching { call("wvDestroy", buildJsonObject { put("id", id) }) }.onFailure { Log.w(TAG, "destroy failed", it) }
    }

    abstract class VisualStateCallback {
        abstract fun onComplete(requestId: Long)
    }

    private fun poll() {
        while (!destroyed.get()) {
            val reply = try {
                call("wvEvents", buildJsonObject { put("id", id) }).jsonObject
            } catch (e: Exception) {
                Log.e(TAG, "The page's events stopped", e)
                return
            }
            for (event in reply["events"]?.jsonArray.orEmpty()) {
                if (destroyed.get()) return
                runCatching { dispatch(event.jsonObject) }.onFailure { Log.e(TAG, "A page event failed", it) }
            }
            if (reply["closed"]?.jsonPrimitive?.booleanOrNull == true) return
        }
    }

    private fun dispatch(event: JsonObject) {
        fun string(key: String) = event[key]?.jsonPrimitive?.contentOrNull.orEmpty()
        fun flag(key: String) = event[key]?.jsonPrimitive?.booleanOrNull == true
        when (string("type")) {
            "pageStarted" -> onMain { webViewClient.onPageStarted(this, string("url"), null) }
            "pageFinished" -> {
                // Stored before the callback, so the extension reads the page's cookies there.
                event["cookies"]?.jsonArray?.forEach { cookie(it.jsonObject)?.let(CookieManager.getInstance()::put) }
                onMain { webViewClient.onPageFinished(this, string("url")) }
            }
            // The browser's store gained or changed cookies (a request after the page finished can set the session one):
            // on Android the app-wide CookieManager has them at once.
            "cookies" -> event["cookies"]?.jsonArray?.forEach { cookie(it.jsonObject)?.let(CookieManager.getInstance()::put) }
            "error" -> {
                val request = Request(Uri.parse(string("url")), flag("mainFrame"), "GET", emptyMap())
                onMain { webViewClient.onReceivedError(this, request, WebResourceError(string("description"))) }
            }
            "console" -> {
                val level = when (string("level")) {
                    "error" -> ConsoleMessage.MessageLevel.ERROR
                    "warn" -> ConsoleMessage.MessageLevel.WARNING
                    "debug" -> ConsoleMessage.MessageLevel.DEBUG
                    else -> ConsoleMessage.MessageLevel.LOG
                }
                val line = event["line"]?.jsonPrimitive?.intOrNull ?: 0
                onMain { webChromeClient?.onConsoleMessage(ConsoleMessage(string("message"), string("source"), line, level)) }
            }
            "gone" -> onMain { webViewClient.onRenderProcessGone(this, RenderProcessGoneDetail(flag("crashed"))) }
            "js" -> {
                val args = event["args"]?.jsonArray.orEmpty().map { it.jsonPrimitive.content }
                javaBridge.execute { invoke(string("name"), string("method"), args) }
            }
            "request" -> bridge.execute { respond(event) }
        }
    }

    private fun invoke(name: String, method: String, args: List<String>) {
        val target = interfaces[name] ?: return
        // shortcut: String parameters only, as the extensions' interfaces take; convert numbers when one takes an int.
        val found = bridged(target).firstOrNull { m -> m.name == method && m.parameterTypes.size == args.size && m.parameterTypes.all { it == String::class.java } }
        if (found == null) {
            Log.w(TAG, "$name.$method(${args.size}) isn't a JavascriptInterface method")
            return
        }
        // The interface is often an anonymous class, which reflection can't call from here without it.
        found.isAccessible = true
        runCatching { found.invoke(target, *args.toTypedArray()) }.onFailure { Log.e(TAG, "$name.$method failed", it) }
    }

    private fun respond(event: JsonObject) {
        val headers = event["headers"]?.jsonObject.orEmpty().mapValues { it.value.jsonPrimitive.content }
        val request = Request(
            Uri.parse(event["url"]?.jsonPrimitive?.content.orEmpty()),
            event["mainFrame"]?.jsonPrimitive?.booleanOrNull == true,
            event["method"]?.jsonPrimitive?.contentOrNull ?: "GET",
            headers,
        )
        // An interceptor that fails lets the request go to the network, so the page never waits on it.
        val response = runCatching { webViewClient.shouldInterceptRequest(this, request)?.let(::toJson) }
            .getOrElse { Log.e(TAG, "shouldInterceptRequest failed", it); null }
        runCatching {
            call(
                "wvRespond",
                buildJsonObject {
                    put("id", id)
                    put("requestId", event["requestId"] ?: JsonNull)
                    put("response", response ?: JsonNull)
                },
            )
        }.onFailure { Log.w(TAG, "wvRespond failed", it) }
    }

    private fun toJson(response: WebResourceResponse) = buildJsonObject {
        put("status", response.statusCode)
        put("reason", response.reasonPhrase)
        put("mimeType", response.mimeType)
        put("encoding", response.encoding)
        put("headers", strings(response.responseHeaders.orEmpty()))
        put("body", Base64.getEncoder().encodeToString(response.data?.use { it.readBytes() } ?: ByteArray(0)))
    }

    private fun page(fields: JsonObjectBuilder.() -> Unit) = buildJsonObject {
        put("id", id)
        fields()
        put(
            "settings",
            buildJsonObject {
                put("userAgent", settings.customUserAgent)
                put("javaScriptEnabled", settings.javaScriptEnabled)
                put("blockImages", settings.blockNetworkImage)
                put(
                    "interfaces",
                    buildJsonArray {
                        for ((name, obj) in interfaces) {
                            add(
                                buildJsonObject {
                                    put("name", name)
                                    put("methods", JsonArray(bridged(obj).map { it.name }.distinct().map { JsonPrimitive(it) }))
                                },
                            )
                        }
                    },
                )
            },
        )
        put("cookies", JsonArray(CookieManager.getInstance().all().map(::toJson)))
    }

    private fun onMain(block: () -> Unit) {
        main.post { if (!destroyed.get()) runCatching(block).onFailure { Log.e(TAG, "A WebView callback failed", it) } }
    }

    private class Request(
        override val url: Uri,
        override val isForMainFrame: Boolean,
        override val method: String,
        override val requestHeaders: Map<String, String>,
    ) : WebResourceRequest

    companion object {
        private val main = Handler(Looper.getMainLooper())

        // Interfaces and interceptors run here, off the main thread, as on Android's WebView threads.
        private val bridge = Executors.newCachedThreadPool { Thread(it, "webview-bridge").apply { isDaemon = true } }
        // Android's one JavaBridge thread: a page's calls run one by one, in the order it made them.
        private val javaBridge = Executors.newSingleThreadExecutor { Thread(it, "JavaBridge").apply { isDaemon = true } }

        /** No Chromium behind it: the extensions' WebView helper probes it for internals, fails, and takes its fallbacks. */
        @JvmStatic
        fun getWebViewClassLoader(): ClassLoader = WebView::class.java.classLoader

        private fun call(method: String, args: JsonObject): JsonElement =
            (Host.call ?: throw IllegalStateException("This app has no browser"))(method, args)

        private fun bridged(obj: Any): List<Method> = obj.javaClass.methods.filter { it.isAnnotationPresent(JavascriptInterface::class.java) }

        private fun strings(map: Map<String, String>) = JsonObject(map.mapValues { JsonPrimitive(it.value) })

        // The protocol's cookie: expiresAt is null for a session cookie.
        private fun toJson(cookie: Cookie) = buildJsonObject {
            put("name", cookie.name)
            put("value", cookie.value)
            put("domain", cookie.domain)
            put("path", cookie.path)
            put("expiresAt", if (cookie.persistent) cookie.expiresAt else null)
            put("secure", cookie.secure)
            put("httpOnly", cookie.httpOnly)
            put("hostOnly", cookie.hostOnly)
        }

        // Browsers write a domain cookie's domain with a leading dot, which OkHttp's builder refuses.
        private fun cookie(json: JsonObject): Cookie? = runCatching {
            fun string(key: String) = json.getValue(key).jsonPrimitive.content
            fun flag(key: String) = json[key]?.jsonPrimitive?.boolean == true
            val domain = string("domain").removePrefix(".")
            Cookie.Builder().name(string("name")).value(string("value")).path(json["path"]?.jsonPrimitive?.contentOrNull ?: "/").apply {
                if (flag("hostOnly")) hostOnlyDomain(domain) else domain(domain)
                json["expiresAt"]?.jsonPrimitive?.doubleOrNull?.let { expiresAt(it.toLong()) }
                if (flag("secure")) secure()
                if (flag("httpOnly")) httpOnly()
            }.build()
        }.onFailure { Log.w(TAG, "Skipped a cookie the browser sent", it) }.getOrNull()
    }
}

/** Android's WebSettings, with Android's defaults; what the browser needs goes with each load. */
class WebSettings internal constructor(private val defaultUserAgent: String) {
    var javaScriptEnabled = false
    var domStorageEnabled = false
    var loadWithOverviewMode = false
    var useWideViewPort = false
    var blockNetworkImage = false

    // Null keeps the browser's own, which a bot check trusts more than any rewrite.
    internal var customUserAgent: String? = null

    var userAgentString: String?
        get() = customUserAgent ?: defaultUserAgent
        set(value) {
            customUserAgent = value
        }

    // The browser refuses popups anyway.
    @Suppress("UNUSED_PARAMETER")
    fun setSupportMultipleWindows(support: Boolean) {}
}
