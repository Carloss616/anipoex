package anipoex.server

import android.graphics.Bitmap
import android.graphics.Layer
import android.graphics.Op
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonPrimitive
import java.util.Base64
import java.util.IdentityHashMap

/**
 * What android.graphics can't do on a java.base runtime: decode, draw and encode. The app does it through [Host]
 * (desktop: a hidden page's canvas; iOS: ImageIO and Core Graphics), in one `renderImage` call per compressed bitmap.
 */
internal object ImageEngine {
    /**
     * Sends `{images, bitmaps, type, quality}`: `images` are base64 encoded files; `bitmaps` are drawn in order, each
     * `{width, height, image?, ops}` with ops `{bitmap, src, dst, matrix}` (an earlier bitmap's index) or `{fill}`.
     * The last one is encoded as `type` (jpeg, png, webp) and comes back base64 encoded.
     */
    fun render(root: Layer, format: Bitmap.CompressFormat, quality: Int): ByteArray {
        val images = mutableListOf<ByteArray>()
        val imageIndex = IdentityHashMap<ByteArray, Int>()
        val bitmaps = mutableListOf<JsonObject>()
        val bitmapIndex = IdentityHashMap<Layer, Int>()
        // A source's own sources come first, so each op names a bitmap already drawn.
        fun add(layer: Layer): Int = bitmapIndex[layer] ?: run {
            val ops = layer.ops.map { op ->
                when (op) {
                    is Op.Draw -> JsonObject(
                        mapOf(
                            "bitmap" to JsonPrimitive(add(op.source)),
                            "src" to numbers(op.src),
                            "dst" to numbers(op.dst),
                            "matrix" to numbers(op.matrix),
                        ),
                    )
                    is Op.Fill -> JsonObject(mapOf("fill" to JsonPrimitive(op.color)))
                }
            }
            val fields = mutableMapOf("width" to JsonPrimitive(layer.width), "height" to JsonPrimitive(layer.height), "ops" to JsonArray(ops))
            layer.image?.let { image -> fields["image"] = JsonPrimitive(imageIndex.getOrPut(image) { images += image; images.size - 1 }) }
            bitmaps += JsonObject(fields)
            (bitmaps.size - 1).also { bitmapIndex[layer] = it }
        }
        add(root)
        val type = when (format) {
            Bitmap.CompressFormat.JPEG -> "jpeg"
            Bitmap.CompressFormat.PNG -> "png"
            else -> "webp"
        }
        val args = JsonObject(
            mapOf(
                "images" to JsonArray(images.map { JsonPrimitive(Base64.getEncoder().encodeToString(it)) }),
                "bitmaps" to JsonArray(bitmaps),
                "type" to JsonPrimitive(type),
                "quality" to JsonPrimitive(quality.coerceIn(0, 100)),
            ),
        )
        val host = Host.call ?: throw IllegalStateException("This app has no image engine")
        return Base64.getDecoder().decode(host("renderImage", args).jsonPrimitive.content)
    }

    /** Width and height from a JPEG, PNG, GIF, WebP or BMP header; null for anything else. */
    fun size(bytes: ByteArray): Pair<Int, Int>? {
        fun u8(i: Int) = bytes[i].toInt() and 0xFF
        fun be16(i: Int) = u8(i) shl 8 or u8(i + 1)
        fun le16(i: Int) = u8(i) or (u8(i + 1) shl 8)
        fun le24(i: Int) = le16(i) or (u8(i + 2) shl 16)
        fun be32(i: Int) = be16(i) shl 16 or be16(i + 2)
        fun le32(i: Int) = le16(i) or (le16(i + 2) shl 16)
        fun ascii(i: Int, text: String) = bytes.size >= i + text.length && text.indices.all { u8(i + it) == text[it].code }
        return try {
            when {
                ascii(1, "PNG") -> be32(16) to be32(20)
                ascii(0, "GIF8") -> le16(6) to le16(8)
                ascii(0, "BM") -> le32(18) to Math.abs(le32(22))
                ascii(0, "RIFF") && ascii(8, "WEBP") -> when {
                    ascii(12, "VP8X") -> le24(24) + 1 to le24(27) + 1
                    ascii(12, "VP8L") -> (le16(21) and 0x3FFF) + 1 to ((le32(21) ushr 14) and 0x3FFF) + 1
                    ascii(12, "VP8 ") -> (le16(26) and 0x3FFF) to (le16(28) and 0x3FFF)
                    else -> null
                }
                u8(0) == 0xFF && u8(1) == 0xD8 -> jpegSize(bytes, ::u8, ::be16)
                else -> null
            }?.takeIf { (width, height) -> width > 0 && height > 0 }
        } catch (_: IndexOutOfBoundsException) {
            null
        }
    }

    // The frame header (SOF0 to SOF15, without DHT, JPG and DAC) holds the size; segments before it are skipped by length.
    private fun jpegSize(bytes: ByteArray, u8: (Int) -> Int, be16: (Int) -> Int): Pair<Int, Int>? {
        var i = 2
        while (i + 9 < bytes.size) {
            if (u8(i) != 0xFF) return null
            val marker = u8(i + 1)
            when {
                marker == 0xFF -> i++
                marker in 0xC0..0xCF && marker != 0xC4 && marker != 0xC8 && marker != 0xCC -> return be16(i + 7) to be16(i + 5)
                marker == 0x01 || marker in 0xD0..0xD7 -> i += 2
                else -> i += 2 + be16(i + 2)
            }
        }
        return null
    }

    private fun numbers(values: FloatArray) = JsonArray(values.map { JsonPrimitive(it) })
}
