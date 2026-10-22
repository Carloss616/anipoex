package anipoex.server

import android.app.Application
import android.webkit.CookieManager
import eu.kanade.tachiyomi.network.GET
import eu.kanade.tachiyomi.network.NetworkHelper
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import mockwebserver3.MockResponse
import mockwebserver3.MockWebServer
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.io.IOException
import java.util.concurrent.LinkedBlockingQueue
import kotlin.concurrent.thread
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class HostTest {
    private val challenge = MockResponse.Builder().code(403).addHeader("cf-mitigated", "challenge").addHeader("Server", "cloudflare").body("challenge").build()

    @AfterEach
    fun reset() {
        Host.solveChallenge = null
        Host.fetch = null
        CookieManager.getInstance().removeAllCookies(null)
    }

    @Test
    fun challengeIsSolvedByTheHostThenRetried(@TempDir dir: File) {
        MockWebServer().use { server ->
            server.start()
            server.enqueue(challenge)
            server.enqueue(MockResponse.Builder().body("list").build())
            val asked = mutableListOf<String>()
            Host.solveChallenge = { url ->
                asked += url
                Host.Solution(listOf("cf_clearance=ok; Path=/"), "Browser/1")
            }
            val client = NetworkHelper(Application(dir, "1.0.0", 1)).client
            val body = client.newCall(GET(server.url("/list").toString())).execute().use { it.body.string() }
            assertEquals("list", body)
            assertEquals(server.url("/list").toString(), asked.single())
            server.takeRequest()
            // The retry carries the clearance and the user agent that earned it.
            val retry = server.takeRequest()
            assertEquals("cf_clearance=ok", retry.headers["Cookie"])
            assertEquals("Browser/1", retry.headers["User-Agent"])
        }
    }

    @Test
    fun solvedHostIsFetchedThroughTheBrowser(@TempDir dir: File) {
        MockWebServer().use { server ->
            server.start()
            server.enqueue(challenge)
            Host.solveChallenge = { Host.Solution(listOf("cf_clearance=ok; Path=/"), "Browser/1") }
            val fetched = mutableListOf<Host.HostRequest>()
            Host.fetch = { request ->
                fetched += request
                Host.HostResponse(200, listOf("Content-Type" to "text/plain", "Set-Cookie" to "seen=1; Path=/"), "via browser".toByteArray())
            }
            val client = NetworkHelper(Application(dir, "1.0.0", 1)).client
            repeat(2) {
                assertEquals("via browser", client.newCall(GET(server.url("/list").toString())).execute().use { it.body.string() })
            }
            // Only the challenge reached OkHttp; both calls went through the browser, with the clearance's user agent.
            assertEquals(1, server.requestCount)
            assertEquals(listOf("Browser/1", "Browser/1"), fetched.map { request -> request.headers.first { it.first == "User-Agent" }.second })
            // A cookie the browser's reply sets is kept for the next request.
            assertEquals(true, fetched.last().headers.any { it.first == "Cookie" && "seen=1" in it.second })
        }
    }

    @Test
    fun expiredClearanceIsSolvedAgain(@TempDir dir: File) {
        MockWebServer().use { server ->
            server.start()
            server.enqueue(challenge)
            var solves = 0
            Host.solveChallenge = { Host.Solution(listOf("cf_clearance=v${++solves}; Path=/"), "Browser/1") }
            // The browser's page gets challenged once its clearance expires.
            val replies = ArrayDeque(listOf(200, 403, 200))
            Host.fetch = {
                val code = replies.removeFirst()
                val headers = if (code == 403) listOf("cf-mitigated" to "challenge", "Server" to "cloudflare") else emptyList()
                Host.HostResponse(code, headers, "$code".toByteArray())
            }
            val client = NetworkHelper(Application(dir, "1.0.0", 1)).client
            assertEquals("200", client.newCall(GET(server.url("/a").toString())).execute().use { it.body.string() })
            assertEquals("200", client.newCall(GET(server.url("/b").toString())).execute().use { it.body.string() })
            assertEquals(2, solves)
        }
    }

    @Test
    fun noClearanceFailsTheCall(@TempDir dir: File) {
        MockWebServer().use { server ->
            server.start()
            server.enqueue(challenge)
            Host.solveChallenge = { Host.Solution(emptyList(), "Browser/1") }
            val client = NetworkHelper(Application(dir, "1.0.0", 1)).client
            assertFailsWith<IOException> { client.newCall(GET(server.url("/").toString())).execute() }
        }
    }

    @Test
    fun hostCallsRoundTrip() {
        val lines = LinkedBlockingQueue<String>()
        val calls = HostCalls(lines::put)
        var result: String? = null
        val caller = thread { result = calls.call("solveChallenge", JsonObject(mapOf("url" to JsonPrimitive("u")))).jsonPrimitive.content }
        val request = Json.parseToJsonElement(lines.take()).jsonObject
        assertEquals("solveChallenge", request.getValue("host").jsonPrimitive.content)
        assertEquals(false, calls.answer("""{"id":1,"result":"not a host reply"}"""))
        assertEquals(true, calls.answer("""{"hostReply":${request.getValue("id")},"result":"done"}"""))
        caller.join()
        assertEquals("done", result)
    }
}
