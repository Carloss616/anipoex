package anipoex.server

import eu.kanade.tachiyomi.source.CatalogueSource
import eu.kanade.tachiyomi.source.model.MangasPage
import eu.kanade.tachiyomi.source.model.SManga
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import mockwebserver3.MockResponse
import mockwebserver3.MockWebServer
import okio.Buffer
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream
import kotlin.test.Test
import kotlin.test.assertContains
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

private const val PKG = "eu.kanade.tachiyomi.extension.all.fixture"
private const val ICON = "data:image/png;base64,iVBORw0KGgo="
private val BADCLASS = File("src/test/fixtures/fixture-badclass.apk")

class ExtensionHostTest {
    @TempDir
    lateinit var dir: File
    private val server = MockWebServer()
    private val exts get() = File(dir, "exts")

    @BeforeEach
    fun start() {
        server.start()
    }

    @AfterEach
    fun stop() = server.close()

    @Test
    fun wrongKeyRejected() {
        val host = ExtensionHost(dir)
        val before = host.installed()
        val error = assertFailsWith<IllegalStateException> { runBlocking { host.install(serve(FIXTURE), "00".repeat(32)) } }
        assertContains(error.message.orEmpty(), "isn't signed by the repo key")
        assertEquals(emptyList(), exts.list()?.toList().orEmpty())
        assertEquals(before, host.installed())
    }

    @Test
    fun failedReinstallKeepsPrevious() {
        seed()
        val host = ExtensionHost(dir)
        assertSeeded(host)
        // (a) the signature fails, (b) it verifies but has no classes.dex to convert, (c) it converts but its class isn't a source.
        assertContains(installError(host, serve(tamper(FIXTURE, File(dir, "tampered.apk"))), FIXTURE_KEY), "doesn't verify")
        assertSeeded(host)
        assertContains(installError(host, serve(FIXTURE), FIXTURE_KEY), "classes.dex")
        assertSeeded(host)
        assertContains(installError(host, serve(BADCLASS), FIXTURE_KEY), "Unknown source class")
        assertSeeded(host)
        // A restart reads the stored files, so they must be the seeded ones.
        assertSeeded(ExtensionHost(dir))
    }

    @Test
    fun noTempLeft() {
        seed()
        val host = ExtensionHost(dir)
        installError(host, serve(FIXTURE), "00".repeat(32))
        installError(host, serve(tamper(FIXTURE, File(dir, "tampered.apk"))), FIXTURE_KEY)
        installError(host, serve(FIXTURE), FIXTURE_KEY)
        installError(host, serve(BADCLASS), FIXTURE_KEY)
        val leftovers = exts.list().orEmpty().filter {
            (it.startsWith("download") && it.endsWith(".apk")) || (it.startsWith("convert") && it.endsWith(".jar")) || it.startsWith("classes") || it.endsWith(".bak")
        }
        assertEquals(emptyList(), leftovers)
        assertEquals(setOf("$PKG.jar", "$PKG.json"), exts.list().orEmpty().toSet())
    }

    private fun serve(apk: File): String {
        server.enqueue(MockResponse.Builder().body(Buffer().write(apk.readBytes())).build())
        return server.url("/${apk.name}").toString()
    }

    private fun installError(host: ExtensionHost, url: String, key: String): String =
        assertFailsWith<Throwable> { runBlocking { host.install(url, key) } }.toString()

    // An installed previous version: a jar with SeededSource's compiled class and the meta ExtensionHost writes.
    private fun seed() {
        exts.mkdirs()
        val name = SeededSource::class.java.name
        val path = name.replace('.', '/') + ".class"
        ZipOutputStream(File(exts, "$PKG.jar").outputStream()).use { zip ->
            zip.putNextEntry(ZipEntry(path))
            zip.write(javaClass.classLoader.getResourceAsStream(path)!!.use { it.readBytes() })
            zip.closeEntry()
        }
        val meta = mapOf("pkg" to PKG, "version" to "1.4.0", "lib" to "1.4", "signingKey" to FIXTURE_KEY, "name" to "Fixture", "classes" to name, "icon" to ICON)
        File(exts, "$PKG.json").writeText(JsonObject(meta.mapValues { JsonPrimitive(it.value) }).toString())
    }

    private fun assertSeeded(host: ExtensionHost) {
        val extension = host.installed().single()
        assertEquals("1.4.0", extension["version"])
        assertEquals(ICON, extension["icon"])
        assertEquals(listOf(mapOf("id" to "1", "name" to "Seeded", "lang" to "en", "homeUrl" to null)), extension["sources"])
        val mangas = runBlocking { host.popular("1", 1) }["mangas"] as List<*>
        assertEquals("Seeded manga", (mangas.single() as Map<*, *>)["title"])
        assertTrue(File(exts, "$PKG.jar").exists())
    }
}

/** The seeded version's source; its class file is copied into the seeded jar. */
class SeededSource : CatalogueSource {
    override val id = 1L
    override val name = "Seeded"
    override val lang = "en"
    override val supportsLatest = false

    override suspend fun getPopularManga(page: Int) = MangasPage(
        listOf(SManga.create().apply {
            url = "/seeded"
            title = "Seeded manga"
        }),
        false,
    )
}
