package anipoex.server

import android.content.SharedPreferences
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.Json
import java.io.File
import java.util.concurrent.CopyOnWriteArrayList

/** SharedPreferences kept as one JSON file, each value tagged with its type so getInt reads back an Int. */
class JsonPreferences(private val file: File) : SharedPreferences {
    private val values: MutableMap<String, Any> = read()
    private val listeners = CopyOnWriteArrayList<SharedPreferences.OnSharedPreferenceChangeListener>()

    override fun getAll(): Map<String, *> = synchronized(this) { values.toMap() }
    override fun getString(key: String, defValue: String?) = get(key) as? String ?: defValue
    @Suppress("UNCHECKED_CAST")
    override fun getStringSet(key: String, defValues: Set<String>?) = get(key) as? Set<String> ?: defValues
    override fun getInt(key: String, defValue: Int) = get(key) as? Int ?: defValue
    override fun getLong(key: String, defValue: Long) = get(key) as? Long ?: defValue
    override fun getFloat(key: String, defValue: Float) = get(key) as? Float ?: defValue
    override fun getBoolean(key: String, defValue: Boolean) = get(key) as? Boolean ?: defValue
    override fun contains(key: String) = get(key) != null
    override fun edit(): SharedPreferences.Editor = Editor()
    override fun registerOnSharedPreferenceChangeListener(listener: SharedPreferences.OnSharedPreferenceChangeListener) { listeners += listener }
    override fun unregisterOnSharedPreferenceChangeListener(listener: SharedPreferences.OnSharedPreferenceChangeListener) { listeners -= listener }

    private fun get(key: String) = synchronized(this) { values[key] }

    private inner class Editor : SharedPreferences.Editor {
        private val changes = mutableMapOf<String, Any?>()
        private var clear = false

        override fun putString(key: String, value: String?) = put(key, value)
        override fun putStringSet(key: String, values: Set<String>?) = put(key, values?.toSet())
        override fun putInt(key: String, value: Int) = put(key, value)
        override fun putLong(key: String, value: Long) = put(key, value)
        override fun putFloat(key: String, value: Float) = put(key, value)
        override fun putBoolean(key: String, value: Boolean) = put(key, value)
        override fun remove(key: String) = put(key, null)
        override fun clear() = apply { clear = true }
        override fun apply() { commit() }

        override fun commit(): Boolean {
            synchronized(this@JsonPreferences) {
                if (clear) values.clear()
                changes.forEach { (key, value) -> if (value == null) values.remove(key) else values[key] = value }
                write()
            }
            changes.keys.forEach { key -> listeners.forEach { it.onSharedPreferenceChanged(this@JsonPreferences, key) } }
            return true
        }

        private fun put(key: String, value: Any?) = apply { changes[key] = value }
    }

    private fun write() {
        file.parentFile.mkdirs()
        val json = buildJsonObject {
            values.forEach { (key, value) ->
                put(key, when (value) {
                    is String -> tagged("s", JsonPrimitive(value))
                    is Int -> tagged("i", JsonPrimitive(value))
                    is Long -> tagged("l", JsonPrimitive(value))
                    is Float -> tagged("f", JsonPrimitive(value))
                    is Boolean -> tagged("b", JsonPrimitive(value))
                    is Set<*> -> tagged("set", JsonArray(value.map { JsonPrimitive(it as String) }))
                    else -> error("Unsupported preference ${value.javaClass}")
                })
            }
        }
        val temp = File(file.path + ".tmp")
        temp.writeText(json.toString())
        temp.renameTo(file)
    }

    private fun tagged(type: String, value: kotlinx.serialization.json.JsonElement) = JsonObject(mapOf("t" to JsonPrimitive(type), "v" to value))

    private fun read(): MutableMap<String, Any> {
        if (!file.exists()) return mutableMapOf()
        return Json.parseToJsonElement(file.readText()).jsonObject.mapValuesTo(mutableMapOf()) { (_, tagged) ->
            val value = tagged.jsonObject.getValue("v")
            when (tagged.jsonObject.getValue("t").jsonPrimitive.content) {
                "s" -> value.jsonPrimitive.content
                "i" -> value.jsonPrimitive.content.toInt()
                "l" -> value.jsonPrimitive.content.toLong()
                "f" -> value.jsonPrimitive.content.toFloat()
                "b" -> value.jsonPrimitive.content.toBoolean()
                else -> value.jsonArray.map { it.jsonPrimitive.content }.toSet()
            }
        }
    }
}
