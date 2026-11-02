package eu.kanade.tachiyomi.network.interceptor

import android.content.Context
import anipoex.server.Host
import eu.kanade.tachiyomi.network.AndroidCookieJar
import okhttp3.Cookie
import okhttp3.Headers
import okhttp3.HttpUrl
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.Interceptor
import okhttp3.Request
import okhttp3.Protocol
import okhttp3.Response
import okhttp3.ResponseBody.Companion.toResponseBody
import okio.Buffer
import java.io.IOException
import java.util.concurrent.ConcurrentHashMap

/**
 * Mihon's CloudflareInterceptor without a WebView: the host app solves the challenge in its own
 * browser (an Electron window on desktop, a WKWebView on iOS) and hands back the cookies.
 * That browser solves as itself, since an Android user agent on a Mac or iPhone gets the
 * interactive check, so the host it solved for gets its user agent from then on. Some sites also
 * tie the clearance to the browser's TLS fingerprint, so when the host can, that host's requests
 * go through the browser's network stack instead of OkHttp's.
 */
class CloudflareInterceptor(
    @Suppress("UNUSED_PARAMETER") context: Context,
    private val cookieManager: AndroidCookieJar,
    @Suppress("UNUSED_PARAMETER") defaultUserAgentProvider: () -> String,
) : Interceptor {

    // Requests to a host wait for one solve instead of each opening a browser.
    private val hostLocks = ConcurrentHashMap<String, Any>()
    private val hostSolves = ConcurrentHashMap<String, Int>()
    private val browserHosts = ConcurrentHashMap.newKeySet<String>()

    // Old domain to the one it redirects to, which challenged: a page there
    // can't fetch the old one.
    private val movedHosts = ConcurrentHashMap<String, String>()

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request().onMovedHost().withUserAgent()
        val browserFetch = Host.fetch?.takeIf { request.url.host in browserHosts }
        // Through the browser too: a clearance that expired gets challenged again and is solved again.
        val response = browserFetch?.let { fetch(it, request) } ?: chain.proceed(request)
        val solve = Host.solveChallenge
        // The cf-mitigated header is Cloudflare's own way to tell a challenge.
        if (solve == null || response.header("cf-mitigated") != "challenge" || response.header("Server") !in SERVER_CHECK) {
            return response
        }
        // After a redirect, the challenge is the landing host's.
        val challenged = response.request.url
        val solves = hostSolves[challenged.host]
        response.close()
        synchronized(hostLocks.computeIfAbsent(challenged.host) { Any() }) {
            // Another request may have solved it while this one waited.
            if (hostSolves[challenged.host] == solves) {
                cookieManager.remove(challenged, COOKIE_NAMES, 0)
                val solution = try {
                    solve(challenged.toString())
                } catch (e: Exception) {
                    throw IOException("Failed to bypass Cloudflare", e)
                }
                val url = challenged.toString()
                solution.cookies.forEach { android.webkit.CookieManager.getInstance().setCookie(url, it) }
                // Cloudflare can let the browser through with no clearance;
                // only its page then reaches the site.
                if (clearance(challenged).isNullOrBlank() && Host.fetch == null) throw IOException("Failed to bypass Cloudflare")
                Host.browserUserAgents[challenged.host] = solution.userAgent
                browserHosts += challenged.host
                hostSolves.merge(challenged.host, 1, Int::plus)
            }
        }
        // Same path: the domain moved. Another path is one link to another site.
        if (challenged.host != request.url.host && challenged.encodedPath == request.url.encodedPath) {
            movedHosts[request.url.host] = challenged.host
        }
        val retry = request.newBuilder().url(challenged).build().withUserAgent()
        return Host.fetch?.let { fetch(it, retry) } ?: chain.proceed(retry)
    }

    private fun fetch(fetch: (Host.HostRequest) -> Host.HostResponse, request: Request): Response {
        val body = request.body?.let { body -> Buffer().also(body::writeTo).readByteArray() }
        val headers = request.headers.toList() +
            listOfNotNull(request.body?.contentType()?.let { "Content-Type" to it.toString() }) +
            listOfNotNull(cookieManager.loadForRequest(request.url).takeIf { it.isNotEmpty() }?.let { cookies -> "Cookie" to cookies.joinToString("; ") { "${it.name}=${it.value}" } })
        val reply = try {
            fetch(Host.HostRequest(request.method, request.url.toString(), headers, body))
        } catch (e: Exception) {
            throw IOException(e.message ?: "Request through the browser failed", e)
        }
        val replyHeaders = Headers.Builder().apply { reply.headers.forEach { (name, value) -> addUnsafeNonAscii(name, value) } }.build()
        // Built here, it skips the OkHttp layer that would keep its cookies.
        cookieManager.saveFromResponse(request.url, Cookie.parseAll(request.url, replyHeaders))
        return Response.Builder()
            .request(request)
            .protocol(Protocol.HTTP_1_1)
            .code(reply.code)
            .message("")
            .headers(replyHeaders)
            .body(reply.body.toResponseBody(replyHeaders["Content-Type"]?.toMediaTypeOrNull()))
            .build()
    }

    // shortcut: a move that also changes paths stays a redirect, solved per
    // request; give it its own path map when a source does that.
    private fun Request.onMovedHost(): Request {
        val host = movedHosts[url.host] ?: return this
        return newBuilder().url(url.newBuilder().host(host).build()).build()
    }

    private fun Request.withUserAgent(): Request {
        val userAgent = Host.browserUserAgent(url.host) ?: return this
        return newBuilder().header("User-Agent", userAgent).build()
    }

    private fun clearance(url: HttpUrl): String? = cookieManager.get(url).firstOrNull { it.name == "cf_clearance" }?.value
}

private val SERVER_CHECK = arrayOf("cloudflare-nginx", "cloudflare")
private val COOKIE_NAMES = listOf("cf_clearance")
