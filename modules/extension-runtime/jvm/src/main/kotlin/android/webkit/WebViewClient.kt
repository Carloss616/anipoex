package android.webkit

import android.graphics.Bitmap
import android.net.Uri
import java.io.InputStream

/** Android's WebViewClient: [WebView] calls it from the page's events, on the main thread except [shouldInterceptRequest]. */
open class WebViewClient {
    open fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {}

    open fun onPageFinished(view: WebView?, url: String?) {}

    open fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest?): WebResourceResponse? = null

    open fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {}

    // Android's default lets the app crash; here the dead page only stops sending events.
    open fun onRenderProcessGone(view: WebView?, detail: RenderProcessGoneDetail?): Boolean = false
}

/** Android's WebChromeClient: the page's console reaches it on the main thread. */
open class WebChromeClient {
    open fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean = false
}

class ConsoleMessage(
    private val text: String,
    private val source: String,
    private val line: Int,
    private val level: MessageLevel,
) {
    fun message(): String = text

    fun sourceId(): String = source

    fun lineNumber(): Int = line

    fun messageLevel(): MessageLevel = level

    enum class MessageLevel { TIP, LOG, WARNING, ERROR, DEBUG }
}

class RenderProcessGoneDetail(private val crashed: Boolean) {
    fun didCrash(): Boolean = crashed
}

interface WebResourceRequest {
    val url: Uri
    val isForMainFrame: Boolean
    val method: String
    val requestHeaders: Map<String, String>
}

/** What an interceptor answers a request with; [WebView] reads [data] fully and hands it to the page. */
class WebResourceResponse(
    var mimeType: String?,
    var encoding: String?,
    val statusCode: Int,
    val reasonPhrase: String?,
    var responseHeaders: Map<String, String>?,
    var data: InputStream?,
) {
    constructor(mimeType: String?, encoding: String?, data: InputStream?) : this(mimeType, encoding, 200, "OK", null, data)
}

class WebResourceError(val description: CharSequence)

object URLUtil {
    private val SCHEMES = listOf("http://", "https://", "file://", "content://", "about:", "javascript:")

    @JvmStatic
    fun isValidUrl(url: String?): Boolean = !url.isNullOrEmpty() && SCHEMES.any { url.startsWith(it, ignoreCase = true) }
}

/** Marks the methods of an [WebView.addJavascriptInterface] object the page may call. */
@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.FUNCTION)
annotation class JavascriptInterface
