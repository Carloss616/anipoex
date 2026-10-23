package anipoex.server

import android.graphics.Bitmap
import android.os.Looper
import android.webkit.ConsoleMessage
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray
import org.junit.jupiter.api.AfterEach
import java.util.Base64
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertNotEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class WebViewTest {
    private val sent = CopyOnWriteArrayList<Pair<String, JsonObject>>()
    private val events = LinkedBlockingQueue<JsonObject>()
    private val responses = LinkedBlockingQueue<JsonObject>()

    @AfterEach
    fun reset() {
        Host.browserUserAgents.clear()
        Host.call = null
        CookieManager.getInstance().removeAllCookies(null)
    }

    // The app's browser, faked: wvEvents hands out the events a test queues, one per call; wvDestroy closes the page.
    private fun browser(loadReply: (JsonObject) -> JsonElement = { JsonNull }, evaluate: (String) -> String = { "null" }) {
        Host.call = { method, args ->
            sent += method to args
            when (method) {
                "wvCreate" -> buildJsonObject {
                    put("id", ids.incrementAndGet())
                    put("userAgent", "Browser/1.0")
                }
                "wvEvents" -> {
                    val event = events.poll(5, TimeUnit.SECONDS)
                    buildJsonObject {
                        putJsonArray("events") { if (event != null && event !== CLOSED) add(event) }
                        put("closed", event === CLOSED)
                    }
                }
                "wvEvaluate" -> JsonPrimitive(evaluate(args.getValue("script").jsonPrimitive.content))
                "wvRespond" -> JsonNull.also { responses += args }
                "wvDestroy" -> JsonNull.also { events += CLOSED }
                "wvLoad", "wvLoadData" -> loadReply(args)
                else -> JsonNull
            }
        }
    }

    private fun event(type: String, vararg fields: Pair<String, JsonElement>) = JsonObject(mapOf("type" to JsonPrimitive(type)) + fields)

    private fun sentArgs(method: String) = sent.filter { it.first == method }.map { it.second }

    private fun <T> onMain(block: suspend () -> T): T = runBlocking { withTimeout(5_000) { withContext(Dispatchers.Main) { block() } } }

    @Test
    fun runsAPageLikeTheExtensionsHelper() {
        browser { script -> if (script == "document.title") "\"Example\"" else "null" }
        val started = CopyOnWriteArrayList<String>()
        val logged = CompletableDeferred<String>()
        val title = onMain {
            assertEquals(Looper.getMainLooper(), Looper.myLooper())
            val done = CompletableDeferred<String>()
            val view = WebView(null)
            assertEquals("Browser/1.0", view.settings.userAgentString)
            view.settings.javaScriptEnabled = true
            view.webViewClient = object : WebViewClient() {
                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                    assertEquals(Looper.getMainLooper(), Looper.myLooper())
                    started += url!!
                    view!!.evaluateJavascript("window.injected = true", null)
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    view!!.evaluateJavascript("document.title") { done.complete(it) }
                }
            }
            view.webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                    assertEquals(ConsoleMessage.MessageLevel.WARNING, consoleMessage!!.messageLevel())
                    logged.complete("${consoleMessage.message()} (${consoleMessage.sourceId()}:${consoleMessage.lineNumber()})")
                    return true
                }
            }
            view.loadUrl("https://example.com/", mapOf("Referer" to "https://example.com/"))
            events += event("pageStarted", "url" to JsonPrimitive("https://example.com/"))
            events += event("console", "level" to JsonPrimitive("warn"), "message" to JsonPrimitive("hi"), "source" to JsonPrimitive("a.js"), "line" to JsonPrimitive(3))
            events += event("pageFinished", "url" to JsonPrimitive("https://example.com/"), "cookies" to JsonArray(emptyList()))
            try {
                done.await()
            } finally {
                view.stopLoading()
                view.destroy()
            }
        }
        assertEquals("\"Example\"", title)
        assertEquals(listOf("https://example.com/"), started)
        assertEquals("hi (a.js:3)", runBlocking { withTimeout(5_000) { logged.await() } })
        // Scripts reach the browser in the order they were sent.
        assertEquals(listOf("window.injected = true", "document.title"), sentArgs("wvEvaluate").map { it.getValue("script").jsonPrimitive.content })
        val load = sentArgs("wvLoad").single()
        assertEquals("https://example.com/", load.getValue("headers").jsonObject.getValue("Referer").jsonPrimitive.content)
        val settings = load.getValue("settings").jsonObject
        assertEquals(JsonNull, settings.getValue("userAgent"))
        assertEquals("true", settings.getValue("javaScriptEnabled").jsonPrimitive.content)
        assertEquals("false", settings.getValue("blockImages").jsonPrimitive.content)
    }

    class Bridge {
        val received = LinkedBlockingQueue<String>()

        @JavascriptInterface
        fun post(message: String) {
            received += "$message on ${Thread.currentThread().name}"
        }

        fun hidden(message: String) {
            received += "hidden $message"
        }
    }

    @Test
    fun pageCallsReachAnnotatedMethodsOffTheMainThread() {
        browser()
        val bridge = Bridge()
        val view = WebView(null)
        // An anonymous object, as the helper registers, needs reflection made accessible.
        val anonymous = LinkedBlockingQueue<String>()
        view.addJavascriptInterface(
            object {
                @JavascriptInterface
                fun postMessage(message: String) {
                    anonymous += message
                }
            },
            "anon",
        )
        view.addJavascriptInterface(bridge, "bridge")
        view.loadDataWithBaseURL("https://example.com/", "<p>", "text/html", "UTF-8", null)
        val interfaces = sentArgs("wvLoadData").single().getValue("settings").jsonObject.getValue("interfaces").jsonArray
            .associate { it.jsonObject.getValue("name").jsonPrimitive.content to it.jsonObject.getValue("methods").jsonArray.map { m -> m.jsonPrimitive.content } }
        assertEquals(mapOf("bridge" to listOf("post"), "anon" to listOf("postMessage")), interfaces)

        fun js(name: String, method: String, vararg args: String) =
            event("js", "name" to JsonPrimitive(name), "method" to JsonPrimitive(method), "args" to JsonArray(args.map { JsonPrimitive(it) }))
        events += js("bridge", "hidden", "x")
        events += js("bridge", "post", "a", "b")
        // In the order the page made them, one at a time, as on Android's JavaBridge thread.
        for (part in 1..20) events += js("bridge", "post", "part $part")
        events += js("anon", "postMessage", "{}")
        assertEquals((1..20).map { "part $it on JavaBridge" }, List(20) { bridge.received.poll(5, TimeUnit.SECONDS) })
        assertEquals("{}", anonymous.poll(5, TimeUnit.SECONDS))
        assertNull(bridge.received.poll(200, TimeUnit.MILLISECONDS))
        view.destroy()
    }

    @Test
    fun interceptedRequestsAreAnsweredWithTheirBody() {
        browser()
        val view = WebView(null)
        val seen = LinkedBlockingQueue<WebResourceRequest>()
        view.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest?): WebResourceResponse? {
                seen += request!!
                if (!request.url.toString().endsWith("/blocked.js")) return null
                return WebResourceResponse("text/javascript", "UTF-8", 403, "Forbidden", mapOf("X-A" to "1"), "no".byteInputStream())
            }
        }
        fun request(requestId: Int, url: String) = event(
            "request",
            "requestId" to JsonPrimitive(requestId),
            "url" to JsonPrimitive(url),
            "method" to JsonPrimitive("POST"),
            "headers" to JsonObject(mapOf("Accept" to JsonPrimitive("*/*"))),
            "mainFrame" to JsonPrimitive(false),
        )
        events += request(1, "https://example.com/blocked.js")
        events += request(2, "https://example.com/ok.js")
        val answers = List(2) { assertNotNull(responses.poll(5, TimeUnit.SECONDS)) }.associateBy { it.getValue("requestId").jsonPrimitive.content }
        val blocked = answers.getValue("1").getValue("response").jsonObject
        assertEquals("403", blocked.getValue("status").jsonPrimitive.content)
        assertEquals("Forbidden", blocked.getValue("reason").jsonPrimitive.content)
        assertEquals("text/javascript", blocked.getValue("mimeType").jsonPrimitive.content)
        assertEquals("UTF-8", blocked.getValue("encoding").jsonPrimitive.content)
        assertEquals("1", blocked.getValue("headers").jsonObject.getValue("X-A").jsonPrimitive.content)
        assertEquals("no", String(Base64.getDecoder().decode(blocked.getValue("body").jsonPrimitive.content)))
        assertEquals(JsonNull, answers.getValue("2").getValue("response"))
        val first = seen.first { it.url.toString().endsWith("/blocked.js") }
        assertEquals("POST", first.method)
        assertEquals("*/*", first.requestHeaders["Accept"])
        assertFalse(first.isForMainFrame)
        view.destroy()
    }

    @Test
    fun cookiesGoWithEachLoadAndComeBackFromThePage() {
        browser()
        val cookies = CookieManager.getInstance()
        cookies.setCookie("https://example.com/", "a=1; Path=/")
        val finished = CompletableDeferred<String?>()
        val view = WebView(null)
        view.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                finished.complete(cookies.getCookie("https://sub.example.com/"))
            }
        }
        view.loadUrl("https://example.com/")
        val sentCookie = sentArgs("wvLoad").single().getValue("cookies").jsonArray.single().jsonObject
        assertEquals(
            mapOf("name" to "a", "value" to "1", "domain" to "example.com", "path" to "/", "expiresAt" to "null", "secure" to "false", "httpOnly" to "false", "hostOnly" to "true"),
            sentCookie.mapValues { it.value.jsonPrimitive.content },
        )

        val expiresAt = System.currentTimeMillis() + 3_600_000
        val earned = buildJsonObject {
            put("name", "clearance")
            put("value", "x")
            put("domain", ".example.com")
            put("path", "/")
            put("expiresAt", expiresAt)
            put("secure", true)
            put("httpOnly", true)
            put("hostOnly", false)
        }
        events += event("pageFinished", "url" to JsonPrimitive("https://example.com/"), "cookies" to JsonArray(listOf(earned)))
        assertEquals("clearance=x", runBlocking { withTimeout(5_000) { finished.await() } })
        assertEquals("a=1; clearance=x", cookies.getCookie("https://example.com/"))
        val stored = cookies.all().single { it.name == "clearance" }
        assertTrue(stored.secure && stored.httpOnly && !stored.hostOnly)
        assertEquals(expiresAt, stored.expiresAt)

        // Set by a request after the page finished (a site's session), as the browser's store reports it.
        val session = buildJsonObject {
            put("name", "session")
            put("value", "s")
            put("domain", "example.com")
            put("path", "/")
            put("expiresAt", JsonNull)
            put("secure", true)
            put("httpOnly", true)
            put("hostOnly", true)
        }
        events += event("cookies", "cookies" to JsonArray(listOf(session)))
        val deadline = System.currentTimeMillis() + 5_000
        while (cookies.getCookie("https://example.com/")?.contains("session=s") != true && System.currentTimeMillis() < deadline) Thread.sleep(20)
        assertEquals("a=1; clearance=x; session=s", cookies.getCookie("https://example.com/"))
        view.destroy()
    }

    // iOS keeps Safari's user agent where an extension asks for Chrome's: the site's session is Safari's then, so the
    // extension's own requests to that site and its subdomains must go out as Safari too.
    @Test
    fun aPageRunAsAnotherBrowserLendsItsUserAgentToTheSite() {
        // The browser answers a load with the user agent it runs as: as asked on one site, its own on the other.
        browser(loadReply = { args -> JsonObject(mapOf("userAgent" to JsonPrimitive(if ("www." in args.toString()) "Chrome/1" else "Safari/1"))) })
        val view = WebView(null)
        view.settings.userAgentString = "Chrome/1"
        view.loadUrl("https://www.example.com/")
        view.loadUrl("https://example.com/")
        assertEquals(mapOf("example.com" to "Safari/1"), Host.browserUserAgents.toMap())
        assertEquals("Safari/1", Host.browserUserAgent("api.example.com"))
        assertNull(Host.browserUserAgent("example.org"))
        view.destroy()
    }

    // Android's old idiom: a `javascript:` URL runs in the current page rather than loading anything.
    @Test
    fun javascriptUrlsRunInThePage() {
        val scripts = LinkedBlockingQueue<String>()
        browser { script -> scripts += script; "null" }
        val view = WebView(null)
        view.loadUrl("javascript:window.bridge.post(document.title%20+%20'!')")
        assertEquals("window.bridge.post(document.title + '!')", scripts.poll(5, TimeUnit.SECONDS))
        assertTrue(sentArgs("wvLoad").isEmpty())
        view.destroy()
    }

    @Test
    fun destroyClosesThePollerOnce() {
        browser()
        val view = WebView(null)
        val id = ids.get()
        val poller = Thread.getAllStackTraces().keys.single { it.name == "webview-events-$id" }
        view.destroy()
        view.destroy()
        poller.join(5_000)
        assertFalse(poller.isAlive)
        assertEquals(1, sentArgs("wvDestroy").size)
        // After destroy, nothing more reaches the browser.
        view.loadUrl("https://example.com/")
        view.evaluateJavascript("1", null)
        view.stopLoading()
        assertEquals(listOf("wvCreate", "wvDestroy"), sent.map { it.first }.filter { it != "wvEvents" })
    }

    @Test
    fun visualStateCallbacksCompleteOnTheMainThread() {
        browser()
        val view = WebView(null)
        val completed = CompletableDeferred<Pair<Long, Boolean>>()
        view.postVisualStateCallback(
            9,
            object : WebView.VisualStateCallback() {
                override fun onComplete(requestId: Long) {
                    completed.complete(requestId to (Looper.myLooper() == Looper.getMainLooper()))
                }
            },
        )
        assertEquals(9L to true, runBlocking { withTimeout(5_000) { completed.await() } })
        assertNull(view.parent)
        assertFalse(view.dispatchTouchEvent(null))
        view.destroy()
    }

    @Test
    fun noBrowserFailsAndChromiumProbesFindNothing() {
        val error = assertFailsWith<IllegalStateException> { WebView(null) }
        assertEquals("This app has no browser", error.message)
        // The helper's probe for Chromium internals; it catches this and takes its fallbacks.
        assertFailsWith<ClassNotFoundException> {
            Class.forName("org.chromium.support_lib_glue.SupportLibReflectionUtil", false, WebView.getWebViewClassLoader())
        }
        assertNotEquals<Any?>(null, runBlocking { withContext(Dispatchers.Main.immediate) { Looper.myLooper() } })
    }

    companion object {
        private val CLOSED = JsonObject(emptyMap())
        private val ids = AtomicInteger()
    }
}
