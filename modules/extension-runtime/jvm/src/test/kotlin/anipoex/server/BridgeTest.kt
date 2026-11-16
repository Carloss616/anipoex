package anipoex.server

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.io.TempDir
import java.io.File
import kotlin.test.Test
import kotlin.test.assertContains
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class BridgeTest {
    @BeforeEach
    fun reset() = Bridge.reset()

    @Test
    fun callBeforeInit() {
        assertContains(Bridge.call("installed", "{}"), "Call init first")
    }

    @Test
    fun unknownMethod(@TempDir dir: File) {
        Bridge.call("init", """{"dataDir":"${dir.path}"}""")
        assertEquals("""{"error":"Unknown method nope"}""", Bridge.call("nope", "{}"))
    }

    @Test
    fun badJson(@TempDir dir: File) {
        Bridge.call("init", """{"dataDir":"${dir.path}"}""")
        val response = Bridge.call("installed", "{")
        assertContains(response, "\"error\"")
        assertFalse(response.contains("Call init first"))
    }

    @Test
    fun installedEmpty(@TempDir dir: File) {
        assertEquals("""{"result":null}""", Bridge.call("init", """{"dataDir":"${dir.path}"}"""))
        assertEquals("""{"result":[]}""", Bridge.call("installed", "{}"))
    }

    private fun stagedChapter(dir: File) {
        Bridge.call("init", """{"dataDir":"${dir.path}"}""")
        File(dir, "cache/staging/s-1").mkdirs()
        File(dir, "cache/staging/s-1/001.jpg").writeBytes(byteArrayOf(1, 2))
        File(dir, "cache/staging/s-1/002.jpg").writeBytes(byteArrayOf(3, 4))
    }

    @Test
    fun packAndUnpack(@TempDir dir: File) {
        stagedChapter(dir)
        val packed = Bridge.call("pack", """{"stage":"s-1","comicInfo":"<ComicInfo/>"}""")
        val uri = Regex("\"uri\":\"([^\"]+)\"").find(packed)!!.groupValues[1]
        assertTrue(uri.endsWith("/s-1.cbz"), packed)
        val pages = Bridge.call("unpack", """{"uri":"$uri","key":"s-1"}""")
        assertEquals(2, Regex("\"index\"").findAll(pages).count(), pages)
        assertContains(pages, "\"index\":0")
        assertContains(pages, "\"index\":1")
        assertEquals(2, Regex("\"uri\":\"file:").findAll(pages).count(), pages)
    }

    @Test
    fun rejectsBadIds(@TempDir dir: File) {
        Bridge.call("init", """{"dataDir":"${dir.path}"}""")
        val response = Bridge.call("pack", """{"stage":"../x","comicInfo":""}""")
        assertContains(response, "\"error\"")
        assertContains(response, "Bad id")
    }

    @Test
    fun rejectsNonCbz(@TempDir dir: File) {
        Bridge.call("init", """{"dataDir":"${dir.path}"}""")
        assertContains(Bridge.call("unpack", """{"uri":"file:///tmp/a.zip","key":"s-1"}"""), "\"error\"")
    }

    @Test
    fun dropStage(@TempDir dir: File) {
        stagedChapter(dir)
        Bridge.call("pack", """{"stage":"s-1","comicInfo":"<ComicInfo/>"}""")
        File(dir, "cache/staging/s-1").mkdirs()
        assertEquals("""{"result":null}""", Bridge.call("dropStage", """{"stage":"s-1"}"""))
        assertFalse(File(dir, "cache/staging/s-1").exists())
        assertFalse(File(dir, "cache/packed/s-1.cbz").exists())
    }
}
