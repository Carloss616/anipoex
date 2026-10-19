package anipoex.server

import kotlin.test.Test
import kotlin.test.assertContains
import kotlin.test.assertTrue

class MainTest {
    @Test
    fun echoesId() {
        val response = handleLine("""{"id":7,"method":"nope"}""")
        assertContains(response, "\"id\":7")
        assertContains(response, "\"error\"")
    }

    @Test
    fun badLine() {
        val response = handleLine("not json")
        assertContains(response, "\"id\":null")
        assertTrue(Regex(""""error":"Bad request""").containsMatchIn(response))
    }
}
