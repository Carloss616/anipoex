package anipoex.server

import android.app.Application
import eu.kanade.tachiyomi.network.NetworkHelper
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
