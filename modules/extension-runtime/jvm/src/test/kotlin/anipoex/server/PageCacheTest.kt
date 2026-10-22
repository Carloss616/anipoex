package anipoex.server

import anipoex.runtime.PageCache
import eu.kanade.tachiyomi.source.online.HttpSource
import kotlinx.coroutines.runBlocking
import mockwebserver3.MockResponse
import mockwebserver3.MockWebServer
import okhttp3.OkHttpClient
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.net.URI
import kotlin.test.Test
import kotlin.test.assertEquals

/** A source whose client reverses each image, as a descrambler's interceptor rewrites the body it downloads. */
private class ReversingSource(override val baseUrl: String) : HttpSource() {
    override val name = "Reversing"
    override val lang = "en"
    override val supportsLatest = false
    override val client: OkHttpClient = network.client.newBuilder()
        .addInterceptor { chain ->
            val response = chain.proceed(chain.request())
            response.newBuilder().body(response.body.bytes().reversedArray().toResponseBody(response.body.contentType())).build()
        }
        .build()
}

class PageCacheTest {
    @Test
    fun pagesComeThroughTheSourceClient(@TempDir dir: File) {
        // Sets up the network every source's client starts from.
        ExtensionHost(dir)
        MockWebServer().use { server ->
            server.start()
            repeat(3) { server.enqueue(MockResponse.Builder().body("page").addHeader("Content-Type", "image/png").build()) }
            val source = ReversingSource(server.url("/").toString())
            val cache = PageCache(File(dir, "pages"), limit = 2)

            val first = runBlocking { cache.fetch(source, server.url("/1.png#scrambled").toString(), 0) }
            assertEquals("egap", File(URI(first.getValue("uri") as String)).readText())
            assertEquals("image/png", first["type"])
            assertEquals(source.headers["User-Agent"], server.takeRequest().headers["User-Agent"])
            // Asked again, as a reader scrolling back does: the file is read, nothing is downloaded.
            val again = runBlocking { cache.fetch(source, server.url("/1.png#scrambled").toString(), 0) }
            assertEquals(first["uri"], again["uri"])
            assertEquals(1, server.requestCount)

            runBlocking {
                cache.fetch(source, server.url("/2.png").toString(), 1)
                cache.fetch(source, server.url("/3.png").toString(), 2)
            }
            assertEquals(2, File(dir, "pages").list()!!.size)
        }
    }
}
