package anipoex.server

import android.net.Uri
import android.text.Html
import android.util.Base64
import android.util.LruCache
import android.webkit.CookieManager
import kotlin.test.Test
import kotlin.test.assertContentEquals
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertNotNull
import kotlin.test.assertNull

class ShimsTest {
    @Test
    fun base64() {
        assertEquals("aGVsbG8=\n", Base64.encodeToString("hello".toByteArray(), Base64.DEFAULT))
        assertEquals("aGVsbG8=", Base64.encodeToString("hello".toByteArray(), Base64.NO_WRAP))
        val bytes = byteArrayOf(0xfb.toByte(), 0xff.toByte())
        assertEquals("-_8", Base64.encodeToString(bytes, Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP))
        assertContentEquals("hello".toByteArray(), Base64.decode("aGVsbG8", Base64.DEFAULT))
        assertContentEquals("hello".toByteArray(), Base64.decode("aGVs\nbG8=", Base64.DEFAULT))
        assertContentEquals("hello".toByteArray(), Base64.decode("aGVsbG8=".toByteArray(), Base64.DEFAULT))
        assertContentEquals(bytes, Base64.decode("-_8", Base64.URL_SAFE))
        assertFailsWith<IllegalArgumentException> { Base64.decode("@@@", Base64.DEFAULT) }
    }

    @Test
    fun uri() {
        assertEquals("a%20b%2Fc", Uri.encode("a b/c"))
        assertEquals("a%20b/c", Uri.encode("a b/c", "/"))
        assertEquals("a b/c", Uri.decode("a%20b%2Fc"))
        val uri = Uri.parse("https://example.com/a/b?x=1&x=2")
        assertEquals(listOf("1", "2"), uri.getQueryParameters("x"))
        assertEquals("1", uri.getQueryParameter("x"))
        assertEquals(listOf("a", "b"), uri.pathSegments)
        assertEquals("https", uri.scheme)
        assertEquals("example.com", uri.host)
        assertEquals("/a/b", uri.path)
        assertEquals("x=1&x=2", uri.query)
        assertEquals("b", uri.lastPathSegment)
        assertEquals(
            "https://example.com/p%20q?k=v%20w",
            Uri.parse("https://example.com").buildUpon().appendPath("p q").appendQueryParameter("k", "v w").build().toString(),
        )
        assertEquals(
            "https://example.com/a/b",
            Uri.parse("https://example.com/a").buildUpon().appendEncodedPath("b").build().toString(),
        )
        assertEquals(
            "https://example.com/a",
            uri.buildUpon().path("/a").clearQuery().build().toString(),
        )
        assertEquals("https://example.com/z", Uri.Builder().scheme("https").authority("example.com").path("/z").build().toString())
    }

    @Test
    fun lruCache() {
        val cache = LruCache<String, Int>(2)
        cache.put("a", 1)
        cache.put("b", 2)
        cache.get("a")
        cache.put("c", 3)
        assertNull(cache.get("b"))
        assertNotNull(cache.get("a"))
        assertEquals(2, cache.size())
        cache.evictAll()
        assertEquals(0, cache.size())
    }

    @Test
    fun cookieManager() {
        val cookies = CookieManager.getInstance()
        cookies.removeAllCookies(null)
        cookies.setCookie("https://example.com/x", "a=1")
        cookies.setCookie("https://example.com/x", "b=2")
        assertEquals("a=1; b=2", cookies.getCookie("https://example.com/y"))
        assertNull(cookies.getCookie("https://other.example.org/"))
        var cleared: Boolean? = null
        cookies.removeAllCookies { cleared = it }
        assertEquals(true, cleared)
        assertNull(cookies.getCookie("https://example.com/y"))
    }

    @Test
    fun html() {
        assertEquals("a\nb & c", Html.fromHtml("a<br>b &amp; c", 0).toString())
        assertEquals("x\n\ny", Html.fromHtml("<p>x</p><p>y</p>", 0).toString())
        assertEquals("plain", Html.fromHtml("<b>plain</b>").toString())
    }
}
