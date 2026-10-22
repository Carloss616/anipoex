/**
 * @see https://github.com/mihonapp/mihon/blob/main/core/common/src/main/kotlin/eu/kanade/tachiyomi/network/interceptor/CloudflareInterceptor.kt
 * @see https://github.com/mihonapp/mihon/blob/main/core/common/src/main/kotlin/eu/kanade/tachiyomi/network/interceptor/WebViewInterceptor.kt
 * @see https://github.com/mihonapp/mihon/blob/main/core/common/src/main/kotlin/eu/kanade/tachiyomi/util/system/WebViewUtil.kt
 */
package eu.kanade.tachiyomi.network.interceptor

import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.ScriptHandler
import androidx.webkit.UserAgentMetadata
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import eu.kanade.tachiyomi.network.AndroidCookieJar
import okhttp3.Headers
import okhttp3.HttpUrl
import okhttp3.Interceptor
import okhttp3.Request
import okhttp3.Response
import java.io.IOException
import java.util.Locale
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.locks.ReentrantReadWriteLock
import kotlin.concurrent.read
import kotlin.concurrent.write

// Mihon's toasts become the IOException's message: the app shows the failed call's error.
class CloudflareInterceptor(
    private val context: Context,
    private val cookieManager: AndroidCookieJar,
    private val defaultUserAgentProvider: () -> String,
) : Interceptor {

    private val mainHandler = Handler(Looper.getMainLooper())

    // Requests to a host share its lock while a challenge is solved under it alone, so concurrent requests wait for
    // one WebView instead of each opening their own
    private val hostLocks = ConcurrentHashMap<String, ReentrantReadWriteLock>()

    private val listenerScript = """
        addEventListener("message", ({data}) => {
            if (data?.source === "cloudflare-challenge") {
                mihon?.postMessage(data.event);
            }
        })
    """.trimIndent()

    private fun shouldIntercept(response: Response): Boolean {
        // The cf-mitigated header is the official way to detect a Cloudflare challenge:
        // https://developers.cloudflare.com/cloudflare-challenges/challenge-types/challenge-pages/detect-response/
        return response.header("cf-mitigated") == "challenge" && response.header("Server") in SERVER_CHECK
    }

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val lock = hostLocks.computeIfAbsent(request.url.host) { ReentrantReadWriteLock() }

        val (response, clearance) = lock.read {
            val response = chain.proceed(request)
            if (!shouldIntercept(response)) return response
            response to clearance(request.url)
        }

        // write releases the read hold of a request made from within another to the same host, like an extension
        // refreshing a token, which would otherwise wait on itself
        lock.write {
            // Another request may have solved the challenge while this one waited
            if (isCleared(request.url, clearance)) {
                response.close()
            } else {
                if (!supportsWebView()) return response
                solve(request, response, clearance)
            }
        }

        return chain.proceed(request)
    }

    private fun clearance(url: HttpUrl): String? {
        return cookieManager.get(url).firstOrNull { it.name == "cf_clearance" }?.value
    }

    private fun isCleared(url: HttpUrl, previousClearance: String?): Boolean {
        val clearance = clearance(url)
        return !clearance.isNullOrBlank() && clearance != previousClearance
    }

    private fun solve(request: Request, response: Response, clearance: String?) {
        try {
            response.close()
            cookieManager.remove(request.url, COOKIE_NAMES, 0)
            resolveWithWebView(request, clearance)
        }
        // OkHttp's enqueue only handles IOExceptions, so wrap the exception to not crash the app
        catch (e: CloudflareBypassException) {
            throw IOException(e.message, e)
        } catch (e: Exception) {
            throw IOException(e)
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun resolveWithWebView(originalRequest: Request, originalClearance: String?) {
        // OkHttp doesn't support asynchronous interceptors, so this thread waits until the WebView finds the solution
        val latch = CountDownLatch(1)

        var webview: WebView? = null
        var listenerScriptHandler: ScriptHandler? = null
        val useIsolatedWorld = WebViewFeature.isFeatureSupported(WebViewFeature.JS_INJECTION_IN_FRAME_AND_WORLD)

        var challengeFound = false
        var cloudflareBypassed = false
        var challengeFailed = false
        var isWebViewOutdated = false
        var isRenderProcessGone = false

        val origRequestUrl = originalRequest.url.toString()
        // A WebView can only load a page with GET, and loading the url of another method usually reaches an
        // endpoint that answers GET without a challenge to solve. The clearance covers the whole site, so it's
        // earned on the site's root page instead.
        val challengeUrl = if (originalRequest.method == "GET") {
            origRequestUrl
        } else {
            originalRequest.url.newBuilder().encodedPath("/").query(null).fragment(null).build().toString()
        }
        val headers = originalRequest.headers.toWebViewHeaders()

        mainHandler.post {
            val view = WebView(context).apply {
                setDefaultSettings()
                // Avoid sending empty User-Agent, Chromium WebView will reset to default if empty
                setUserAgent(originalRequest.header("User-Agent") ?: defaultUserAgentProvider())
            }
            webview = view

            fun onChallengeEvent(event: String) {
                when (event) {
                    // The challenge cannot be solved non-interactively, abort.
                    "interactiveBegin" -> latch.countDown()
                    "fail" -> {
                        challengeFailed = true
                        latch.countDown()
                    }
                }
            }

            if (useIsolatedWorld) {
                // An isolated world keeps the bridge out of the page's reach
                val world = WebViewCompat.getExecutionWorld(view, "mihon")
                val origins = setOf(originalRequest.url.origin())
                WebViewCompat.addWebMessageListener(view, "mihon", origins, world) { _, message, _, isMainFrame, _ ->
                    if (isMainFrame) message.data?.let(::onChallengeEvent)
                }
                listenerScriptHandler = WebViewCompat.addJavaScriptOnEvent(
                    view,
                    listenerScript,
                    WebViewCompat.INJECTION_EVENT_DOCUMENT_START,
                    origins,
                    world,
                )
            } else {
                view.addJavascriptInterface(
                    object {
                        @Suppress("unused")
                        @JavascriptInterface
                        fun postMessage(event: String) = onChallengeEvent(event)
                    },
                    "mihon",
                )
            }

            view.webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView, url: String) {
                    if (!challengeFailed && isCleared(originalRequest.url, originalClearance)) {
                        cloudflareBypassed = true
                        latch.countDown()
                    }

                    if (url == challengeUrl) {
                        if (!challengeFound) {
                            // The first request didn't return the challenge, abort.
                            latch.countDown()
                        } else if (!useIsolatedWorld) {
                            view.evaluateJavascript(listenerScript, null)
                        }
                    }
                }

                override fun onReceivedHttpError(
                    view: WebView?,
                    request: WebResourceRequest?,
                    errorResponse: WebResourceResponse?,
                ) {
                    if (request?.isForMainFrame == true) {
                        if (errorResponse?.responseHeaders?.get("cf-mitigated") == "challenge") {
                            // Found the Cloudflare challenge page.
                            challengeFound = true
                        } else {
                            // Unlock thread, the challenge wasn't found.
                            latch.countDown()
                        }
                    }
                }

                override fun onRenderProcessGone(view: WebView, detail: RenderProcessGoneDetail): Boolean {
                    // Not handling it kills the app, failing the bypass is enough
                    Log.e(TAG, "WebView renderer gone during Cloudflare bypass: crashed=${detail.didCrash()}, url=$origRequestUrl")
                    isRenderProcessGone = true
                    latch.countDown()
                    return true
                }
            }

            view.loadUrl(challengeUrl, headers)
        }

        latch.await(30, TimeUnit.SECONDS)

        mainHandler.post {
            // Only destroy can be called on a WebView whose renderer is gone
            if (!cloudflareBypassed && !isRenderProcessGone) {
                isWebViewOutdated = webview?.isOutdated() == true
            }

            webview?.run {
                if (!isRenderProcessGone) {
                    if (useIsolatedWorld) {
                        WebViewCompat.removeWebMessageListener(this, WebViewCompat.getExecutionWorld(this, "mihon"), "mihon")
                    } else {
                        removeJavascriptInterface("mihon")
                    }
                    listenerScriptHandler?.remove()
                    stopLoading()
                }
                destroy()
            }
        }

        // Throw exception if we failed to bypass Cloudflare
        if (!cloudflareBypassed) {
            // A clearance from a failed challenge would only be rejected again
            cookieManager.remove(originalRequest.url, COOKIE_NAMES, 0)
            throw CloudflareBypassException(
                if (isWebViewOutdated) "Failed to bypass Cloudflare: update Android System WebView" else "Failed to bypass Cloudflare",
            )
        }
    }

    private fun supportsWebView(): Boolean {
        try {
            // May throw MissingWebViewPackageException if WebView is not installed
            CookieManager.getInstance()
        } catch (e: Throwable) {
            Log.e(TAG, "No WebView to solve a Cloudflare challenge", e)
            return false
        }
        return context.packageManager.hasSystemFeature(PackageManager.FEATURE_WEBVIEW)
    }
}

@SuppressLint("SetJavaScriptEnabled")
private fun WebView.setDefaultSettings() {
    with(settings) {
        javaScriptEnabled = true
        domStorageEnabled = true
        useWideViewPort = true
        loadWithOverviewMode = true
        cacheMode = WebSettings.LOAD_DEFAULT
        setSupportMultipleWindows(true)
    }
    CookieManager.getInstance().acceptThirdPartyCookies(this)
}

/** Sets the user agent with matching Sec-CH-UA client hints, which otherwise keep advertising the real WebView brand and version. */
private fun WebView.setUserAgent(userAgent: String) {
    settings.userAgentString = userAgent

    if (!WebViewFeature.isFeatureSupported(WebViewFeature.USER_AGENT_METADATA)) return

    val versionMatch = CHROME_VERSION_REGEX.find(userAgent) ?: return
    val majorVersion = versionMatch.groupValues[1]
    val fullVersion = majorVersion + versionMatch.groupValues[2].ifEmpty { ".0.0.0" }

    try {
        val metadata = WebSettingsCompat.getUserAgentMetadata(settings)
        val brandVersionList = metadata.brandVersionList.map { brandVersion ->
            val brand = when (brandVersion.brand) {
                WEBVIEW_BRAND -> CHROME_BRAND
                CHROMIUM_BRAND -> CHROMIUM_BRAND
                else -> return@map brandVersion
            }
            UserAgentMetadata.BrandVersion.Builder()
                .setBrand(brand)
                .setMajorVersion(majorVersion)
                .setFullVersion(fullVersion)
                .build()
        }
        WebSettingsCompat.setUserAgentMetadata(
            settings,
            UserAgentMetadata.Builder(metadata).setBrandVersionList(brandVersionList).setFullVersion(fullVersion).build(),
        )
    } catch (e: Exception) {
        Log.e(TAG, "Failed to set user agent metadata", e)
    }
}

private fun WebView.isOutdated(): Boolean {
    // Clearing the user agent makes the getter return the default one, which names the real Chrome version
    val original = settings.userAgentString
    settings.userAgentString = null
    val default = settings.userAgentString
    settings.userAgentString = original
    val major = """.*Chrome/(\d+)\..*""".toRegex().matchEntire(default)?.groupValues?.get(1)?.toInt() ?: 0
    return major < MINIMUM_WEBVIEW_VERSION
}

// Keeping an unsafe header makes the WebView throw net::ERR_INVALID_ARGUMENT
private fun Headers.toWebViewHeaders(): Map<String, String> = filter { (name, value) -> isRequestHeaderSafe(name, value) }
    .groupBy(keySelector = { (name, _) -> name }) { (_, value) -> value }
    .mapValues { it.value.getOrNull(0).orEmpty() }

// Based on IsRequestHeaderSafe in https://source.chromium.org/chromium/chromium/src/+/main:services/network/public/cpp/header_util.cc
private fun isRequestHeaderSafe(name: String, value: String): Boolean {
    val lowerName = name.lowercase(Locale.ENGLISH)
    if (lowerName in UNSAFE_HEADER_NAMES || lowerName.startsWith("proxy-")) return false
    return !(lowerName == "connection" && value.lowercase(Locale.ENGLISH) == "upgrade")
}

// An origin rule without a port only matches the scheme's default one
private fun HttpUrl.origin(): String {
    return if (port == HttpUrl.defaultPort(scheme)) "$scheme://$host" else "$scheme://$host:$port"
}

private const val TAG = "CloudflareInterceptor"
private const val MINIMUM_WEBVIEW_VERSION = 118
private val SERVER_CHECK = arrayOf("cloudflare-nginx", "cloudflare")
private val COOKIE_NAMES = listOf("cf_clearance")
private val UNSAFE_HEADER_NAMES = listOf(
    "content-length", "host", "trailer", "te", "upgrade", "cookie2", "keep-alive", "transfer-encoding", "set-cookie",
    // Renderer is killed if it doesn't match the request initiator
    "origin",
)
private const val WEBVIEW_BRAND = "Android WebView"
private const val CHROMIUM_BRAND = "Chromium"
private const val CHROME_BRAND = "Google Chrome"
private val CHROME_VERSION_REGEX = """Chrome/(\d+)(\.[\d.]+)?""".toRegex()

private class CloudflareBypassException(message: String) : Exception(message)
