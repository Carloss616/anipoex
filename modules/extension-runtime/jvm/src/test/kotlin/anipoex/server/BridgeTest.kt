package anipoex.server

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.io.TempDir
import java.io.File
import kotlin.test.Test
import kotlin.test.assertContains
import kotlin.test.assertEquals
import kotlin.test.assertFalse

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
}
