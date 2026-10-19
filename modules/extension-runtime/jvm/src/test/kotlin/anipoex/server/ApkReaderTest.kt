package anipoex.server

import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.util.Base64
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream
import kotlin.test.Test
import kotlin.test.assertContentEquals
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

private val FIXTURES = File("src/test/fixtures")
internal val FIXTURE = File(FIXTURES, "fixture.apk")

// The fixture's signing key, as its README states it.
internal val FIXTURE_KEY = Regex("[0-9a-f]{64}").find(File(FIXTURES, "README.md").readText())!!.value

class ApkReaderTest {
    @Test
    fun readsManifest() {
        val apk = readApk(FIXTURE)
        assertEquals("eu.kanade.tachiyomi.extension.all.fixture", apk.packageName)
        assertEquals("1.4.1", apk.versionName)
        assertEquals("Fixture", apk.metaData["tachiyomix.name"])
        assertEquals("Fixture", apk.label)
        assertEquals("Fixture", extensionName(apk))
    }

    @Test
    fun nameFromLabel() {
        val apk = readApk(File(FIXTURES, "fixture-noname.apk"))
        assertNull(apk.metaData["tachiyomix.name"])
        assertEquals("Tachiyomi: Fixture Label", apk.label)
        assertEquals("Fixture Label", extensionName(apk))
    }

    @Test
    fun nameFallsBackToPackage() {
        val blank = ApkInfo("eu.kanade.tachiyomi.extension.all.fixture", "1.4.1", "Tachiyomi: ", emptyMap(), emptyList())
        assertEquals("eu.kanade.tachiyomi.extension.all.fixture", extensionName(blank))
        assertEquals("eu.kanade.tachiyomi.extension.all.fixture", extensionName(ApkInfo(blank.packageName, null, null, emptyMap(), emptyList())))
    }

    @Test
    fun signerMatchesReadme() {
        assertEquals(FIXTURE_KEY, readApk(FIXTURE).signers.single())
    }

    @Test
    fun tamperedFails(@TempDir dir: File) {
        val tampered = tamper(FIXTURE, File(dir, "tampered.apk"))
        val error = assertFailsWith<IllegalStateException> { readApk(tampered) }
        assertTrue("doesn't verify" in error.message.orEmpty(), error.message)
    }

    @Test
    fun iconIsLargestPng() {
        val icon = assertNotNull(apkIcon(FIXTURE))
        assertTrue(icon.startsWith("data:image/png;base64,"))
        val bytes = Base64.getDecoder().decode(icon.removePrefix("data:image/png;base64,"))
        assertContentEquals(File(FIXTURES, "res/mipmap-xhdpi/ic_launcher.png").readBytes(), bytes)
    }

    @Test
    fun noPngNoIcon(@TempDir dir: File) {
        val zip = File(dir, "plain.apk")
        ZipOutputStream(zip.outputStream()).use {
            it.putNextEntry(ZipEntry("res/raw/notes.txt"))
            it.write("not an icon".toByteArray())
            it.closeEntry()
        }
        assertNull(apkIcon(zip))
    }
}

/** Copies [apk] to [out] with its middle byte inverted. */
internal fun tamper(apk: File, out: File): File {
    val bytes = apk.readBytes()
    bytes[bytes.size / 2] = bytes[bytes.size / 2].toInt().inv().toByte()
    out.writeBytes(bytes)
    return out
}
