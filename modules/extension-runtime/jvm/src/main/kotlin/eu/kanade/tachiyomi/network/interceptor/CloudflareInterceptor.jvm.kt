package eu.kanade.tachiyomi.network.interceptor

import android.content.Context
import eu.kanade.tachiyomi.network.AndroidCookieJar
import okhttp3.Interceptor
import okhttp3.Response

// shortcut: passes through, since the JVM has no WebView to solve the challenge in; desktop could solve it in an Electron window and iOS in a WKWebView.
class CloudflareInterceptor(
    @Suppress("UNUSED_PARAMETER") context: Context,
    @Suppress("UNUSED_PARAMETER") cookieManager: AndroidCookieJar,
    @Suppress("UNUSED_PARAMETER") defaultUserAgentProvider: () -> String,
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response = chain.proceed(chain.request())
}
