package anipoex.server

import android.content.SharedPreferences
import org.junit.jupiter.api.io.TempDir
import java.io.File
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse

class JsonPreferencesTest {
    @Test
    fun roundTrip(@TempDir dir: File) {
        val file = File(dir, "prefs.json")
        JsonPreferences(file).edit()
            .putString("s", "text").putInt("i", 3).putLong("l", 4_000_000_000L).putFloat("f", 1.5f)
            .putBoolean("b", true).putStringSet("set", setOf("a", "b")).commit()

        val prefs = JsonPreferences(file)
        assertEquals("text", prefs.getString("s", null))
        assertEquals(3, prefs.getInt("i", 0))
        assertEquals(4_000_000_000L, prefs.getLong("l", 0))
        assertEquals(1.5f, prefs.getFloat("f", 0f))
        assertEquals(true, prefs.getBoolean("b", false))
        assertEquals(setOf("a", "b"), prefs.getStringSet("set", null))
    }

    @Test
    fun removeAndClearPersist(@TempDir dir: File) {
        val file = File(dir, "prefs.json")
        JsonPreferences(file).edit().putString("a", "1").putString("b", "2").commit()
        JsonPreferences(file).edit().remove("a").commit()
        assertFalse(JsonPreferences(file).contains("a"))
        assertEquals("2", JsonPreferences(file).getString("b", null))

        JsonPreferences(file).edit().clear().commit()
        assertEquals(emptyMap<String, Any>(), JsonPreferences(file).all)
    }

    @Test
    fun listenerGetsKey(@TempDir dir: File) {
        val prefs = JsonPreferences(File(dir, "prefs.json"))
        val keys = mutableListOf<String>()
        val listener = SharedPreferences.OnSharedPreferenceChangeListener { _, key -> keys += key }
        prefs.registerOnSharedPreferenceChangeListener(listener)
        prefs.edit().putString("k", "v").commit()
        assertEquals(listOf("k"), keys)
    }
}
