/** @see https://github.com/mihonapp/mihon/blob/main/core/common/src/main/kotlin/eu/kanade/tachiyomi/network/NetworkHelper.kt */
package eu.kanade.tachiyomi.network

import android.content.Context
import eu.kanade.tachiyomi.network.interceptor.CloudflareInterceptor
import eu.kanade.tachiyomi.network.interceptor.UncaughtExceptionInterceptor
import eu.kanade.tachiyomi.network.interceptor.UserAgentInterceptor
import okhttp3.Cache
import okhttp3.Dns
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.OkHttpClient
import okhttp3.dnsoverhttps.DnsOverHttps
import java.io.File
import java.net.InetAddress
import java.net.UnknownHostException
import java.util.concurrent.TimeUnit

// shortcut: no cookie jar, so sites that need session cookies fail; add Mihon's AndroidCookieJar when a source needs it.
class NetworkHelper(private val context: Context) {

    private val preferences = context.getSharedPreferences("network", Context.MODE_PRIVATE)

    private val cache = Cache(File(context.cacheDir, "network_cache"), 5L * 1024 * 1024)

    // DoH queries go through a bare client: the sources' interceptors don't apply to them.
    private val resolvers: Map<String, Dns> = run {
        val bootstrap = OkHttpClient.Builder().cache(cache).build()
        DOH_PROVIDERS.mapValues { (_, provider) ->
            DnsOverHttps.Builder()
                .client(bootstrap)
                .url(provider.url.toHttpUrl())
                .bootstrapDnsHosts(provider.bootstrap.map(InetAddress::getByName))
                .build()
        } + (SYSTEM_DNS to Dns.SYSTEM)
    }

    /** The resolver every source uses: `system` or a DOH_PROVIDERS id. Applies to the next lookup, no restart. */
    @Volatile
    var dns: String = preferences.getString(DNS_KEY, null)?.takeIf { it in resolvers } ?: DEFAULT_DNS
        set(value) {
            require(value in resolvers) { "Unknown DNS $value" }
            preferences.edit().putString(DNS_KEY, value).apply()
            field = value
        }

    val client: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .callTimeout(2, TimeUnit.MINUTES)
            .cache(cache)
            // Sources keep this client, so the lookup reads the current choice instead of fixing one.
            .dns { hostname ->
                val resolver = resolvers.getValue(dns)
                // DoH refuses private hosts (localhost, LAN names) and can be down: the system's resolver backs it.
                try {
                    resolver.lookup(hostname)
                } catch (e: UnknownHostException) {
                    if (resolver === Dns.SYSTEM) throw e
                    Dns.SYSTEM.lookup(hostname)
                }
            }
            .addInterceptor(UncaughtExceptionInterceptor())
            .addInterceptor(UserAgentInterceptor(::defaultUserAgentProvider))
            .addInterceptor(CloudflareInterceptor())
            .build()
    }

    @Deprecated("The regular client handles Cloudflare by default")
    @Suppress("UNUSED")
    val cloudflareClient: OkHttpClient get() = client

    fun defaultUserAgentProvider() = DEFAULT_USER_AGENT
}

private class DohProvider(val url: String, val bootstrap: List<String>)

private const val DNS_KEY = "dns"
private const val SYSTEM_DNS = "system"
// Some ISPs' resolvers block manga sites, so sources resolve over HTTPS unless the user picks the system's.
private const val DEFAULT_DNS = "cloudflare"

/** @see https://github.com/mihonapp/mihon/blob/main/core/common/src/main/kotlin/eu/kanade/tachiyomi/network/DohProviders.kt */
private val DOH_PROVIDERS = mapOf(
    "cloudflare" to DohProvider(
        "https://cloudflare-dns.com/dns-query",
        listOf("162.159.36.1", "162.159.46.1", "1.1.1.1", "1.0.0.1", "2606:4700:4700::1111", "2606:4700:4700::1001"),
    ),
    "google" to DohProvider(
        "https://dns.google/dns-query",
        listOf("8.8.4.4", "8.8.8.8", "2001:4860:4860::8888", "2001:4860:4860::8844"),
    ),
    "adguard" to DohProvider(
        "https://dns-unfiltered.adguard.com/dns-query",
        listOf("94.140.14.140", "94.140.14.141", "2a10:50c0::1:ff", "2a10:50c0::2:ff"),
    ),
    "quad9" to DohProvider(
        "https://dns.quad9.net/dns-query",
        listOf("9.9.9.9", "149.112.112.112", "2620:fe::fe", "2620:fe::9"),
    ),
)

private const val DEFAULT_USER_AGENT =
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36"
