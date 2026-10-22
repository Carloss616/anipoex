package anipoex.server

import android.app.Application
import android.webkit.CookieManager
import eu.kanade.tachiyomi.network.GET
import eu.kanade.tachiyomi.network.NetworkHelper
import mockwebserver3.MockResponse
import mockwebserver3.MockWebServer
import org.junit.jupiter.api.io.TempDir
import java.io.File
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class NetworkHelperTest {
    private fun network(dir: File) = NetworkHelper(Application(dir, "1.0.0", 1))

    @Test
    fun dnsDefaultsToCloudflareAndPersists(@TempDir dir: File) {
        val first = network(dir)
        assertEquals("cloudflare", first.dns)
        first.dns = "system"
        assertEquals("system", network(dir).dns)
    }

    // A page that sets a cookie and reloads: the retry only works if the client sent the cookie back.
    @Test
    fun clientKeepsCookiesBetweenRequests(@TempDir dir: File) {
        CookieManager.getInstance().removeAllCookies(null)
        MockWebServer().use { server ->
            server.start()
            server.enqueue(MockResponse.Builder().addHeader("Set-Cookie", "session=abc; Max-Age=172800; Path=/").body("verify").build())
            server.enqueue(MockResponse.Builder().body("list").build())
            val client = network(dir).client
            client.newCall(GET(server.url("/library").toString())).execute().close()
            client.newCall(GET(server.url("/library?q=x").toString())).execute().close()
            server.takeRequest()
            assertEquals("session=abc", server.takeRequest().headers["Cookie"])
        }
        CookieManager.getInstance().removeAllCookies(null)
    }

    @Test
    fun privateHostsFallBackToSystem(@TempDir dir: File) {
        assertTrue(network(dir).client.dns.lookup("localhost").isNotEmpty())
    }

    @Test
    fun unknownDnsIsRejected(@TempDir dir: File) {
        val network = network(dir)
        assertFailsWith<IllegalArgumentException> { network.dns = "nope" }
        assertEquals("cloudflare", network.dns)
    }

    @Test
    fun bridgeReadsAndSetsDns(@TempDir dir: File) {
        Bridge.reset()
        Bridge.call("init", """{"dataDir":"${dir.path}"}""")
        assertEquals("""{"result":null}""", Bridge.call("setDns", """{"dns":"quad9"}"""))
        assertEquals("""{"result":"quad9"}""", Bridge.call("getDns", "{}"))
        Bridge.reset()
    }
}
