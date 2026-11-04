package anipoex.server

import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer
import java.util.zip.CRC32
import java.util.zip.Deflater
import java.util.zip.DeflaterOutputStream
import java.util.zip.InflaterInputStream

/**
 * The PNGs pixels travel in between the runtime and the app's image engine
 * (see [ImageEngine]): 8-bit RGB or RGBA, not interlaced, which is what the
 * engines write. Pixels are Android's ARGB ints.
 * @see <a href="https://www.w3.org/TR/png-3/">PNG (Third Edition)</a>
 */
internal object Png {
    private val SIGNATURE = byteArrayOf(-119, 80, 78, 71, 13, 10, 26, 10)

    class Image(val width: Int, val height: Int, val argb: IntArray)

    fun encode(width: Int, height: Int, argb: IntArray): ByteArray {
        // Unfiltered rows: smaller files aren't worth the time for a PNG that
        // only crosses to the app.
        val raw = ByteArray(height * (1 + width * 4))
        var i = 0
        for (y in 0 until height) {
            i++
            for (x in 0 until width) {
                val color = argb[y * width + x]
                raw[i++] = (color shr 16).toByte()
                raw[i++] = (color shr 8).toByte()
                raw[i++] = color.toByte()
                raw[i++] = (color ushr 24).toByte()
            }
        }
        val out = ByteArrayOutputStream()
        out.write(SIGNATURE)
        chunk(out, "IHDR", ByteBuffer.allocate(13).putInt(width).putInt(height).put(8).put(6).array())
        chunk(out, "IDAT", ByteArrayOutputStream().also { DeflaterOutputStream(it, Deflater(Deflater.BEST_SPEED)).use { deflate -> deflate.write(raw) } }.toByteArray())
        chunk(out, "IEND", ByteArray(0))
        return out.toByteArray()
    }

    fun decode(png: ByteArray): Image {
        require(png.size > 8 && png.copyOf(8).contentEquals(SIGNATURE)) { "Not a PNG" }
        val buffer = ByteBuffer.wrap(png)
        var at = 8
        var width = 0
        var height = 0
        var channels = 0
        val idat = ByteArrayOutputStream()
        while (at + 12 <= png.size) {
            val length = buffer.getInt(at)
            val data = at + 8
            when (String(png, at + 4, 4, Charsets.ISO_8859_1)) {
                "IHDR" -> {
                    width = buffer.getInt(data)
                    height = buffer.getInt(data + 4)
                    channels = when (png[data + 9].toInt()) {
                        2 -> 3
                        6 -> 4
                        else -> 0
                    }
                    require(png[data + 8].toInt() == 8 && channels > 0 && png[data + 12].toInt() == 0) { "Unsupported PNG" }
                }
                "IDAT" -> idat.write(png, data, length)
                "IEND" -> break
            }
            at = data + length + 4
        }
        val stride = width * channels
        val raw = InflaterInputStream(idat.toByteArray().inputStream()).use { it.readBytes() }
        require(channels > 0 && raw.size >= height * (stride + 1)) { "Truncated PNG" }
        val argb = IntArray(width * height)
        var previous = ByteArray(stride)
        var line = ByteArray(stride)
        for (y in 0 until height) {
            val row = y * (stride + 1)
            val filter = raw[row].toInt()
            for (i in 0 until stride) {
                val left = if (i >= channels) line[i - channels].toInt() and 0xFF else 0
                val up = previous[i].toInt() and 0xFF
                val upLeft = if (i >= channels) previous[i - channels].toInt() and 0xFF else 0
                val predicted = when (filter) {
                    0 -> 0
                    1 -> left
                    2 -> up
                    3 -> (left + up) / 2
                    4 -> paeth(left, up, upLeft)
                    else -> throw IllegalArgumentException("Unknown PNG filter $filter")
                }
                line[i] = (raw[row + 1 + i] + predicted).toByte()
            }
            for (x in 0 until width) {
                val p = x * channels
                val alpha = if (channels == 4) line[p + 3].toInt() and 0xFF else 0xFF
                argb[y * width + x] = (alpha shl 24) or ((line[p].toInt() and 0xFF) shl 16) or ((line[p + 1].toInt() and 0xFF) shl 8) or (line[p + 2].toInt() and 0xFF)
            }
            previous = line.also { line = previous }
        }
        return Image(width, height, argb)
    }

    private fun paeth(left: Int, up: Int, upLeft: Int): Int {
        val estimate = left + up - upLeft
        val toLeft = Math.abs(estimate - left)
        val toUp = Math.abs(estimate - up)
        val toUpLeft = Math.abs(estimate - upLeft)
        return if (toLeft <= toUp && toLeft <= toUpLeft) left else if (toUp <= toUpLeft) up else upLeft
    }

    private fun chunk(out: ByteArrayOutputStream, type: String, data: ByteArray) {
        val typed = type.toByteArray(Charsets.ISO_8859_1) + data
        out.write(ByteBuffer.allocate(4).putInt(data.size).array())
        out.write(typed)
        out.write(ByteBuffer.allocate(4).putInt(CRC32().apply { update(typed) }.value.toInt()).array())
    }
}
