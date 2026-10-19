package anipoex.server

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.io.TempDir
import java.io.File
import kotlin.test.Test
import kotlin.test.assertContains
import kotlin.test.assertEquals

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
    fun badJson() {
        assertContains(Bridge.call("installed", "{"), "\"error\"")
    }

    @Test
    fun installedEmpty(@TempDir dir: File) {
        assertEquals("""{"result":null}""", Bridge.call("init", """{"dataDir":"${dir.path}"}"""))
        assertEquals("""{"result":[]}""", Bridge.call("installed", "{}"))
    }
}
