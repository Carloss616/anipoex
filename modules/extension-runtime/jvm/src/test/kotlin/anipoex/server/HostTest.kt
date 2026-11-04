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
        Host.browserUserAgents.clear()
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
            // The retry carries the clearance and its user agent.
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
            // Only the challenge reached OkHttp; both calls went through the
            // browser, with the clearance's user agent.
            assertEquals(1, server.requestCount)
            assertEquals(listOf("Browser/1", "Browser/1"), fetched.map { request -> request.headers.first { it.first == "User-Agent" }.second })
            // A cookie the browser's reply sets is kept for the next request.
            assertEquals(true, fetched.last().headers.any { it.first == "Cookie" && "seen=1" in it.second })
        }
    }

    // A source builds its next URL on response.request.url, which a redirect
    // the browser followed must carry.
    @Test
    fun browserRedirectEndsOnTheResponsesRequest(@TempDir dir: File) {
        MockWebServer().use { server ->
            server.start()
            server.enqueue(challenge)
            Host.solveChallenge = { Host.Solution(listOf("cf_clearance=ok; Path=/"), "Browser/1") }
            Host.fetch = { request -> Host.HostResponse(200, emptyList(), "page".toByteArray(), request.url.replace("/?p=1", "/title/one/").substringBefore('#')) }
            val client = NetworkHelper(Application(dir, "1.0.0", 1)).client
            assertEquals(server.url("/title/one/"), client.newCall(GET(server.url("/?p=1").toString())).execute().request.url)
            // No redirect: the reply's URL is the request's without its
            // fragment, which the source still sees.
            val scrambled = server.url("/001.jpg").newBuilder().fragment("scramble=1").build()
            assertEquals(scrambled, client.newCall(GET(scrambled.toString())).execute().request.url)
        }
    }

    @Test
    fun challengeBehindARedirectIsSolvedOnTheHostItMovedTo(@TempDir dir: File) {
        MockWebServer().use { server ->
            server.start()
            val old = server.url("/list")
            val moved = old.newBuilder().host(if (old.host == "localhost") "127.0.0.1" else "localhost").build()
            server.enqueue(MockResponse.Builder().code(301).addHeader("Location", moved.toString()).build())
            server.enqueue(challenge)
            val asked = mutableListOf<String>()
            Host.solveChallenge = { url ->
                asked += url
                Host.Solution(listOf("cf_clearance=ok; Path=/"), "Browser/1")
            }
            val fetched = mutableListOf<Host.HostRequest>()
            Host.fetch = { request ->
                fetched += request
                Host.HostResponse(200, emptyList(), "via browser".toByteArray())
            }
            val client = NetworkHelper(Application(dir, "1.0.0", 1)).client
            assertEquals("via browser", client.newCall(GET(old.toString())).execute().use { it.body.string() })
            // The next call names the old host too: it goes straight to the new
            // one, with no second solve.
            assertEquals("via browser", client.newCall(GET(server.url("/next").toString())).execute().use { it.body.string() })
            assertEquals(listOf(moved.toString()), asked)
            assertEquals(listOf(moved.toString(), moved.newBuilder().encodedPath("/next").build().toString()), fetched.map { it.url })
            assertEquals(listOf("Browser/1", "Browser/1"), fetched.map { request -> request.headers.first { it.first == "User-Agent" }.second })
            assertEquals(2, server.requestCount)
        }
    }

    @Test
    fun redirectToAnotherPathIsNotADomainMove(@TempDir dir: File) {
        MockWebServer().use { server ->
            server.start()
            val old = server.url("/link")
            val other = old.newBuilder().host(if (old.host == "localhost") "127.0.0.1" else "localhost").encodedPath("/elsewhere").build()
            server.enqueue(MockResponse.Builder().code(301).addHeader("Location", other.toString()).build())
            server.enqueue(challenge)
            server.enqueue(MockResponse.Builder().body("old host").build())
            Host.solveChallenge = { Host.Solution(listOf("cf_clearance=ok; Path=/"), "Browser/1") }
            Host.fetch = { Host.HostResponse(200, emptyList(), "via browser".toByteArray()) }
            val client = NetworkHelper(Application(dir, "1.0.0", 1)).client
            assertEquals("via browser", client.newCall(GET(old.toString())).execute().use { it.body.string() })
            // The old host's other pages stay on the old host.
            assertEquals("old host", client.newCall(GET(server.url("/list").toString())).execute().use { it.body.string() })
        }
    }

    @Test
    fun browserLetThroughWithoutAClearanceFetchesForTheRuntime(@TempDir dir: File) {
        MockWebServer().use { server ->
            server.start()
            server.enqueue(challenge)
            var solves = 0
            Host.solveChallenge = {
                solves++
                Host.Solution(emptyList(), "Browser/1")
            }
            Host.fetch = { Host.HostResponse(200, emptyList(), "via browser".toByteArray()) }
            val client = NetworkHelper(Application(dir, "1.0.0", 1)).client
            repeat(2) {
                assertEquals("via browser", client.newCall(GET(server.url("/list").toString())).execute().use { it.body.string() })
            }
            assertEquals(1, solves)
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
