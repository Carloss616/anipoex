package anipoex.server

import kotlin.test.AfterTest
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import mockwebserver3.MockResponse
import mockwebserver3.MockWebServer
import okhttp3.CompressionInterceptor
import okhttp3.Gzip
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.zstd.Zstd
import okio.Buffer
import okio.GzipSink
import okio.buffer

class ZstdStubTest {
    private val server = MockWebServer()
    private val client = OkHttpClient.Builder().addInterceptor(CompressionInterceptor(Zstd, Gzip)).build()

    @BeforeTest
    fun start() = server.start()

    @AfterTest
    fun stop() = server.close()

    private fun get(): String = client.newCall(Request.Builder().url(server.url("/")).build()).execute().use { it.body.string() }

    @Test
    fun advertisesNoZstd() {
        server.enqueue(MockResponse.Builder().body("hello").build())
        get()
        assertEquals("identity, gzip", server.takeRequest().headers["Accept-Encoding"])
    }

    @Test
    fun identityPassesThrough() {
        server.enqueue(MockResponse.Builder().addHeader("Content-Encoding", "identity").body("hello").build())
        assertEquals("hello", get())
    }

    @Test
    fun gzipStillWorks() {
        val gzipped = Buffer().also { GzipSink(it).buffer().use { sink -> sink.writeUtf8("hello") } }
        server.enqueue(MockResponse.Builder().addHeader("Content-Encoding", "gzip").body(gzipped).build())
        assertEquals("hello", get())
    }
}
