package anipoex.server

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Rect
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.float
import kotlinx.serialization.json.int
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.jupiter.api.AfterEach
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import java.util.Base64
import javax.imageio.ImageIO
import kotlin.test.Test
import kotlin.test.assertContentEquals
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertNull

class ImageEngineTest {
    @AfterEach
    fun reset() {
        Host.call = null
    }

    private fun encoded(format: String, width: Int, height: Int): ByteArray =
        ByteArrayOutputStream().also { ImageIO.write(BufferedImage(width, height, BufferedImage.TYPE_INT_RGB), format, it) }.toByteArray()

    @Test
    fun sizesFromHeaders() {
        for (format in listOf("png", "jpg", "gif", "bmp")) assertEquals(37 to 21, ImageEngine.size(encoded(format, 37, 21)), format)
        // WebP's three headers, as the RIFF chunks begin.
        fun webp(chunk: String, body: List<Int>) = ("RIFF\u0000\u0000\u0000\u0000WEBP$chunk".toByteArray() + ByteArray(4) + body.map(Int::toByte)).let { it + ByteArray(32) }
        assertEquals(800 to 12000, ImageEngine.size(webp("VP8X", listOf(0, 0, 0, 0, 0x1F, 0x03, 0, 0xDF, 0x2E, 0))))
        // Lossless: 14 bits of width - 1, then 14 of height - 1, after the 0x2F signature.
        val w = 640 - 1
        val h = 960 - 1
        val bits = w or (h shl 14)
        assertEquals(640 to 960, ImageEngine.size(webp("VP8L", listOf(0x2F, bits and 0xFF, bits shr 8 and 0xFF, bits shr 16 and 0xFF, bits shr 24 and 0xFF))))
        assertEquals(320 to 240, ImageEngine.size(webp("VP8 ", listOf(0, 0, 0, 0x9D, 0x01, 0x2A, 320 and 0xFF, 320 shr 8, 240, 0))))
        assertNull(ImageEngine.size("<html>Not found</html>".toByteArray()))
        assertNull(ImageEngine.size(byteArrayOf(0xFF.toByte(), 0xD8.toByte())))
    }

    // A page cut in two and swapped, as a source's descrambler does: one image sent once, both tiles from it.
    @Test
    fun descramblingSendsOneRenderCall() {
        val page = encoded("png", 10, 20)
        var sent: JsonObject? = null
        Host.call = { method, args ->
            assertEquals("renderImage", method)
            sent = args
            JsonPrimitive(Base64.getEncoder().encodeToString(byteArrayOf(1, 2, 3)))
        }
        val source = BitmapFactory.decodeStream(page.inputStream())!!
        assertEquals(10, source.getWidth())
        val result = Bitmap.createBitmap(10, 20, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(result)
        canvas.drawColor(0xFF000000.toInt())
        canvas.drawBitmap(source, Rect(0, 0, 10, 10), Rect(0, 10, 10, 20), null)
        canvas.save()
        canvas.translate(2f, 3f)
        canvas.scale(2f, 2f)
        canvas.drawBitmap(source, Rect(0, 10, 10, 20), Rect(0, 0, 10, 10), null)
        canvas.restore()
        val out = ByteArrayOutputStream()
        result.compress(Bitmap.CompressFormat.JPEG, 90, out)

        assertContentEquals(byteArrayOf(1, 2, 3), out.toByteArray())
        val args = sent!!
        assertContentEquals(page, Base64.getDecoder().decode(args.getValue("images").jsonArray.single().jsonPrimitive.content))
        val (decoded, root) = args.getValue("bitmaps").jsonArray.map { it.jsonObject }
        assertEquals(0, decoded.getValue("image").jsonPrimitive.int)
        assertEquals(20, root.getValue("height").jsonPrimitive.int)
        val ops = root.getValue("ops").jsonArray.map { it.jsonObject }
        assertEquals(0xFF000000.toInt(), ops[0].getValue("fill").jsonPrimitive.int)
        fun floats(op: JsonObject, key: String) = op.getValue(key).jsonArray.map { it.jsonPrimitive.float }
        assertEquals(listOf(0f, 0f, 10f, 10f), floats(ops[1], "src"))
        assertEquals(listOf(0f, 10f, 10f, 20f), floats(ops[1], "dst"))
        assertEquals(listOf(1f, 0f, 0f, 1f, 0f, 0f), floats(ops[1], "matrix"))
        // translate(2, 3) then scale(2, 2): a point (x, y) lands on (2x + 2, 2y + 3).
        assertEquals(listOf(2f, 0f, 0f, 2f, 2f, 3f), floats(ops[2], "matrix"))
        assertEquals(listOf(0, 0), ops.drop(1).map { it.getValue("bitmap").jsonPrimitive.int })
        assertEquals("jpeg", args.getValue("type").jsonPrimitive.content)
        assertEquals(90, args.getValue("quality").jsonPrimitive.int)
    }

    @Test
    fun undecodableBytesGiveNull() {
        assertNull(BitmapFactory.decodeByteArray(ByteArray(8), 0, 8))
        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        assertNull(BitmapFactory.decodeByteArray(encoded("png", 4, 5), 0, encoded("png", 4, 5).size, bounds))
        assertEquals(4 to 5, bounds.outWidth to bounds.outHeight)
    }

    @Test
    fun noEngineFailsTheCompress() {
        val bitmap = Bitmap.createBitmap(1, 1, Bitmap.Config.ARGB_8888)
        assertFailsWith<IllegalStateException> { bitmap.compress(Bitmap.CompressFormat.PNG, 100, ByteArrayOutputStream()) }
    }
}
