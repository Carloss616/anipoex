package anipoex.runtime

import org.junit.jupiter.api.io.TempDir
import java.io.ByteArrayOutputStream
import java.io.File
import java.util.zip.ZipEntry
import java.util.zip.ZipFile
import java.util.zip.ZipOutputStream
import kotlin.test.Test
import kotlin.test.assertContentEquals
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class ChapterArchiveTest {
    @TempDir
    lateinit var tmp: File

    private fun bytes(vararg v: Int) = ByteArray(v.size) { v[it].toByte() }

    private fun zip(vararg entries: Pair<String, String>): ByteArray {
        val out = ByteArrayOutputStream()
        ZipOutputStream(out).use { z ->
            entries.forEach { (name, body) ->
                z.putNextEntry(ZipEntry(name))
                z.write(body.toByteArray())
                z.closeEntry()
            }
        }
        return out.toByteArray()
    }

    private fun stageOf(vararg names: String): File {
        val stage = File(tmp, "stage").apply { mkdirs() }
        names.forEach { File(stage, it).writeText("bytes of $it") }
        return stage
    }

    @Test
    fun extensionFromType() {
        val head = ByteArray(0)
        assertEquals("jpg", ChapterArchive.extension("image/jpeg", head))
        assertEquals("png", ChapterArchive.extension("image/png", head))
        assertEquals("webp", ChapterArchive.extension("IMAGE/WEBP", head))
        assertEquals("gif", ChapterArchive.extension("image/gif", head))
        assertEquals("avif", ChapterArchive.extension("image/avif", head))
    }

    @Test
    fun extensionFromBytes() {
        assertEquals("jpg", ChapterArchive.extension(null, bytes(0xFF, 0xD8, 0xFF, 0xE0)))
        assertEquals("png", ChapterArchive.extension(null, bytes(0x89, 0x50, 0x4E, 0x47, 0x0D)))
        assertEquals("webp", ChapterArchive.extension(null, "RIFF1234WEBP".toByteArray()))
        assertEquals("gif", ChapterArchive.extension(null, "GIF89a".toByteArray()))
        assertEquals("avif", ChapterArchive.extension(null, "\u0000\u0000\u0000 ftypavif".toByteArray()))
        assertEquals("jpg", ChapterArchive.extension(null, bytes(0, 0, 0, 0)))
    }

    @Test
    fun packRoundTrip() {
        val stage = stageOf("010.jpg", "001.jpg", "002.png")
        val dest = File(tmp, "out/ch.cbz")
        ChapterArchive.pack(stage, "<ComicInfo/>", dest)
        val files = ChapterArchive.unpack(dest.inputStream(), File(tmp, "x"))
        assertEquals(listOf("001.jpg", "002.png", "010.jpg"), files.map { it.name })
        files.forEach { assertContentEquals("bytes of ${it.name}".toByteArray(), it.readBytes()) }
    }

    @Test
    fun imagesStored() {
        val dest = File(tmp, "ch.cbz")
        ChapterArchive.pack(stageOf("001.jpg", "002.png"), "<ComicInfo>x</ComicInfo>", dest)
        ZipFile(dest).use { z ->
            z.entries().asSequence().filter { it.name != "ComicInfo.xml" }.forEach { assertEquals(ZipEntry.STORED, it.method) }
            assertEquals("<ComicInfo>x</ComicInfo>", z.getInputStream(z.getEntry("ComicInfo.xml")).readBytes().decodeToString())
        }
    }

    @Test
    fun packCleansUp() {
        val stage = stageOf("001.jpg")
        val dest = File(tmp, "ch.cbz")
        ChapterArchive.pack(stage, "<ComicInfo/>", dest)
        assertFalse(stage.exists())
        assertTrue(dest.parentFile.listFiles().orEmpty().none { it.name.endsWith(".part") })
    }

    @Test
    fun unpackSkipsUnsafe() {
        val dir = File(tmp, "dir")
        val data = zip("../evil.jpg" to "e", "/abs.jpg" to "a", "sub/" to "", "ComicInfo.xml" to "<x/>", "001.jpg" to "1")
        assertEquals(listOf("001.jpg"), ChapterArchive.unpack(data.inputStream(), dir).map { it.name })
        assertFalse(File(dir.parent, "evil.jpg").exists())
    }

    @Test
    fun unpackNaturalOrder() {
        val data = zip("p2.jpg" to "2", "p10.jpg" to "10", "p1.jpg" to "1")
        assertEquals(listOf("p1.jpg", "p2.jpg", "p10.jpg"), ChapterArchive.unpack(data.inputStream(), File(tmp, "d")).map { it.name })
    }

    @Test
    fun pruneKeepsNewest() {
        val parent = File(tmp, "parent")
        (1..5).forEach { File(parent, "d$it").apply { mkdirs() }.setLastModified(it * 1000L) }
        ChapterArchive.prune(parent, 3)
        assertEquals(listOf("d3", "d4", "d5"), parent.listFiles().orEmpty().map { it.name }.sorted())
    }

    @Test
    fun checkIdRejects() {
        assertEquals("21-1-a1b2c3d4", ChapterArchive.checkId("21-1-a1b2c3d4"))
        listOf("../x", "", "a/b").forEach { assertFailsWith<IllegalArgumentException> { ChapterArchive.checkId(it) } }
    }
}
