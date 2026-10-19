/**
 * @see https://github.com/mihonapp/mihon/blob/main/core/common/src/main/kotlin/eu/kanade/tachiyomi/network/interceptor/UncaughtExceptionInterceptor.kt
 * @see https://github.com/mihonapp/mihon/blob/main/core/common/src/main/kotlin/eu/kanade/tachiyomi/network/interceptor/UserAgentInterceptor.kt
 * @see https://github.com/mihonapp/mihon/blob/main/core/common/src/main/kotlin/eu/kanade/tachiyomi/network/interceptor/CloudflareInterceptor.kt
 */
package eu.kanade.tachiyomi.network.interceptor

import okhttp3.Interceptor
import okhttp3.Response
import java.io.IOException

// Some extensions refuse a client without these three, matched by simple class name.

class UncaughtExceptionInterceptor : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response = try {
        chain.proceed(chain.request())
    } catch (e: Exception) {
        throw e as? IOException ?: IOException(e)
    }
}

class UserAgentInterceptor(private val defaultUserAgentProvider: () -> String) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        if (!request.header("User-Agent").isNullOrEmpty()) return chain.proceed(request)
        return chain.proceed(request.newBuilder().header("User-Agent", defaultUserAgentProvider()).build())
    }
}

// shortcut: passes through; Mihon solves the challenge in a WebView and stores the cookies. Port it when a source sits behind Cloudflare.
class CloudflareInterceptor : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response = chain.proceed(chain.request())
}
