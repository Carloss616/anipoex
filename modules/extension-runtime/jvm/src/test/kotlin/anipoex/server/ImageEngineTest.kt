package anipoex.server

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.Typeface
import android.text.Layout
import android.text.StaticLayout
import android.text.TextPaint
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
        assertEquals(640 to 960, ImageEngine.size(avif()))
        assertNull(ImageEngine.size(avif().copyOf(60)))
        assertNull(ImageEngine.size("<html>Not found</html>".toByteArray()))
        assertNull(ImageEngine.size(byteArrayOf(0xFF.toByte(), 0xD8.toByte())))
    }

    // An AVIF grid: item 2 is a 10×10 tile listed first, item 1 (primary) the 640×960 image, its ispe flagged essential.
    private fun avif(): ByteArray {
        fun box(type: String, vararg content: ByteArray): ByteArray {
            val body = content.fold(ByteArray(0)) { all, part -> all + part }
            return java.nio.ByteBuffer.allocate(8 + body.size).putInt(8 + body.size).put(type.toByteArray()).put(body).array()
        }
        fun ints(vararg values: Int) = java.nio.ByteBuffer.allocate(4 * values.size).apply { values.forEach(::putInt) }.array()
        fun ispe(width: Int, height: Int) = box("ispe", ints(0, width, height))
        val ipma = box("ipma", ints(0, 2), byteArrayOf(0, 2, 1, 1, 0, 1, 1, 0x82.toByte()))
        val meta = box("meta", ints(0), box("pitm", ints(0), byteArrayOf(0, 1)), box("iprp", box("ipco", ispe(10, 10), ispe(640, 960)), ipma))
        return box("ftyp", "avifmif1".toByteArray()) + meta
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

    // A text page as sources make one: a white bitmap, a bold heading and a centered body, through a translate.
    @Test
    fun textGoesAsLines() {
        var sent: JsonObject? = null
        Host.call = { _, args ->
            sent = args
            JsonPrimitive("")
        }
        val bitmap = Bitmap.createBitmap(200, 100, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        canvas.drawColor(Color.WHITE)
        val heading = Paint().apply {
            setTextSize(20f)
            setTypeface(Typeface.DEFAULT_BOLD)
            setStyle(Paint.Style.STROKE)
            setStrokeWidth(2f)
        }
        canvas.drawText("Title", 5f, 18f, heading)
        heading.setTextSize(99f)
        val body = StaticLayout("one two three", TextPaint().apply { setTextSize(20f) }, 80, Layout.Alignment.ALIGN_CENTER, 1f, 0f, true)
        canvas.save()
        canvas.translate(10f, 30f)
        body.draw(canvas)
        canvas.restore()
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, ByteArrayOutputStream())

        val ops = sent!!.getValue("bitmaps").jsonArray.single().jsonObject.getValue("ops").jsonArray.map { it.jsonObject }
        fun JsonObject.text(key: String) = getValue(key).jsonPrimitive.content
        val title = ops[1]
        assertEquals(listOf("Title", "20.0", "true", "left", "stroke", "2.0"), listOf("text", "size", "bold", "align", "style", "strokeWidth").map(title::text))
        assertNull(title["maxWidth"])
        val lines = ops.drop(2)
        assertEquals(listOf("one two", "three"), lines.map { it.text("text") })
        assertEquals(listOf("center", "40.0", "80.0", "false"), listOf("align", "x", "maxWidth", "bold").map(lines[0]::text))
        // Baselines one line height apart, below the first line's ascent.
        assertEquals(listOf(18.6f, 42f), lines.map { it.getValue("y").jsonPrimitive.float })
        assertEquals(listOf(1f, 0f, 0f, 1f, 10f, 30f), lines[0].getValue("matrix").jsonArray.map { it.jsonPrimitive.float })
    }

    @Test
    fun undecodableBytesGiveNull() {
        assertNull(BitmapFactory.decodeByteArray(ByteArray(8), 0, 8))
        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        assertNull(BitmapFactory.decodeByteArray(encoded("png", 4, 5), 0, encoded("png", 4, 5).size, bounds))
        assertEquals(4 to 5, bounds.outWidth to bounds.outHeight)
    }

    @Test
    fun eraseColorDropsWhatWasDrawn() {
        var sent: JsonObject? = null
        Host.call = { _, args ->
            sent = args
            JsonPrimitive("")
        }
        val bitmap = BitmapFactory.decodeStream(encoded("png", 4, 5).inputStream())!!
        Canvas(bitmap).drawText("x", 0f, 0f, Paint())
        bitmap.eraseColor(Color.WHITE)
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, ByteArrayOutputStream())
        val root = sent!!.getValue("bitmaps").jsonArray.single().jsonObject
        assertNull(root["image"])
        assertEquals(Color.WHITE, root.getValue("ops").jsonArray.single().jsonObject.getValue("fill").jsonPrimitive.int)
    }

    // A source that reads a page's pixels, moves some and writes them back: the engine draws it once as a PNG.
    @Test
    fun pixelsComeFromTheEngineAndGoBackAsPng() {
        val drawn = IntArray(6) { 0xFF000000.toInt() or it }
        val sent = mutableListOf<JsonObject>()
        Host.call = { _, args ->
            sent += args
            JsonPrimitive(Base64.getEncoder().encodeToString(Png.encode(3, 2, drawn)))
        }
        val bitmap = BitmapFactory.decodeStream(encoded("png", 3, 2).inputStream())!!
        val row = IntArray(4)
        bitmap.getPixels(row, 1, 3, 0, 1, 3, 1)
        assertContentEquals(intArrayOf(0) + drawn.copyOfRange(3, 6), row)
        bitmap.setPixels(intArrayOf(-1, -2), 0, 1, 2, 0, 1, 2)
        bitmap.compress(Bitmap.CompressFormat.JPEG, 80, ByteArrayOutputStream())

        assertEquals(2, sent.size)
        val image = Png.decode(Base64.getDecoder().decode(sent[1].getValue("images").jsonArray.single().jsonPrimitive.content))
        assertContentEquals(intArrayOf(drawn[0], drawn[1], -1, drawn[3], drawn[4], -2), image.argb)
        assertEquals("[]", sent[1].getValue("bitmaps").jsonArray.single().jsonObject.getValue("ops").toString())
    }

    @Test
    fun bitmapFromColorsNeedsNoEngineToRead() {
        val bitmap = Bitmap.createBitmap(intArrayOf(1, 2, 3, 4, 5), 2, 2, Bitmap.Config.ARGB_8888)
        val out = IntArray(4)
        bitmap.getPixels(out, 0, 2, 0, 0, 2, 2)
        assertContentEquals(intArrayOf(1, 2, 3, 4), out)
        assertFailsWith<IllegalArgumentException> { bitmap.getPixels(out, 0, 2, 1, 0, 2, 1) }
        val blank = IntArray(1) { 7 }
        Bitmap.createBitmap(1, 1, Bitmap.Config.ARGB_8888).getPixels(blank, 0, 1, 0, 0, 1, 1)
        assertContentEquals(intArrayOf(0), blank)
    }

    // ImageIO's writer picks a filter per row, so every filter is decoded; our own PNGs read back in ImageIO.
    @Test
    fun pngRoundTrips() {
        val random = java.util.Random(1)
        for (type in listOf(BufferedImage.TYPE_INT_ARGB, BufferedImage.TYPE_INT_RGB)) {
            val image = BufferedImage(37, 21, type)
            for (y in 0 until 21) for (x in 0 until 37) image.setRGB(x, y, if (x % 5 == 0) random.nextInt() else (x * 7) or (y shl 9) or (0x80 shl 24))
            val expected = image.getRGB(0, 0, 37, 21, null, 0, 37)
            val decoded = Png.decode(ByteArrayOutputStream().also { ImageIO.write(image, "png", it) }.toByteArray())
            assertEquals(37 to 21, decoded.width to decoded.height)
            assertContentEquals(expected, decoded.argb)
            val back = ImageIO.read(Png.encode(37, 21, expected).inputStream())
            assertContentEquals(expected, back.getRGB(0, 0, 37, 21, null, 0, 37))
        }
    }

    @Test
    fun noEngineFailsTheCompress() {
        val bitmap = Bitmap.createBitmap(1, 1, Bitmap.Config.ARGB_8888)
        assertFailsWith<IllegalStateException> { bitmap.compress(Bitmap.CompressFormat.PNG, 100, ByteArrayOutputStream()) }
    }
}
