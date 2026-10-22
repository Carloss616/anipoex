package anipoex.server

import app.cash.quickjs.QuickJs
import app.cash.quickjs.QuickJsException
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonPrimitive
import org.junit.jupiter.api.AfterEach
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertNull

class QuickJsTest {
    private val sent = mutableListOf<String>()

    @AfterEach
    fun reset() {
        Host.call = null
    }

    // The app's engine, faked: each script's reply is the JSON it stands for.
    private fun engine(replies: Map<String, String>) {
        Host.call = { method, args ->
            sent += method
            when (method) {
                "jsCreate" -> JsonPrimitive(7)
                "jsEvaluate" -> {
                    assertEquals(7, args.getValue("id").jsonPrimitive.content.toInt())
                    val script = args.getValue("script").jsonPrimitive.content
                    Json.parseToJsonElement(replies[script] ?: error("ReferenceError: $script is not defined"))
                }
                else -> JsonPrimitive(null as String?)
            }
        }
    }

    @Test
    fun resultsComeBackAsQuickJsTypes() {
        engine(mapOf("s" to "\"a-b\"", "i" to "3", "d" to "1.5", "b" to "true", "n" to "null", "a" to "[1, \"x\", null]"))
        QuickJs.create().use { js ->
            assertEquals("a-b", js.evaluate("s"))
            assertEquals(3, js.evaluate("i"))
            assertEquals(1.5, js.evaluate("d"))
            assertEquals(true, js.evaluate("b"))
            assertNull(js.evaluate("n"))
            assertEquals(listOf(1, "x", null), (js.evaluate("a") as Array<*>).toList())
        }
        assertEquals(listOf("jsCreate", "jsEvaluate", "jsEvaluate", "jsEvaluate", "jsEvaluate", "jsEvaluate", "jsEvaluate", "jsClose"), sent)
    }

    @Test
    fun scriptErrorsThrowQuickJsException() {
        engine(emptyMap())
        QuickJs.create().use { js ->
            val error = assertFailsWith<QuickJsException> { js.evaluate("missing()") }
            assertEquals("ReferenceError: missing() is not defined", error.message)
        }
    }

    @Test
    fun noEngineFailsAsAScriptError() {
        assertFailsWith<QuickJsException> { QuickJs.create() }
    }
}
