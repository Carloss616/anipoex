package android.graphics

import anipoex.server.ImageEngine
import anipoex.server.Png
import java.io.OutputStream

/**
 * Android's Bitmap without pixels: the image it was decoded from plus what
 * was drawn on it, which the app's own engine renders on [compress] (see
 * [ImageEngine]). Enough for sources that cut a page into tiles and put
 * them back in order. Reading or writing pixels has the engine draw it
 * once, as a PNG, and keeps them until something is drawn on it.
 */
class Bitmap internal constructor(private val width: Int, private val height: Int, private var image: ByteArray?) {
    enum class Config { ALPHA_8, RGB_565, ARGB_4444, ARGB_8888, RGBA_F16, HARDWARE, RGBA_1010102 }

    enum class CompressFormat { JPEG, PNG, WEBP, WEBP_LOSSY, WEBP_LOSSLESS }

    private val ops = mutableListOf<Op>()
    // What it looks like now, kept until it's drawn on again so a source
    // drawn tile by tile is sent once.
    private var layer: Layer? = null
    private var recycled = false
    // ARGB, while a source works on pixels: they are then the bitmap, and
    // [image] their PNG (null after a write).
    private var pixels: IntArray? = null

    fun getWidth(): Int = width

    fun getHeight(): Int = height

    fun getConfig(): Config = Config.ARGB_8888

    fun isMutable(): Boolean = true

    fun hasAlpha(): Boolean = true

    fun isRecycled(): Boolean = recycled

    fun recycle() {
        recycled = true
        image = null
        ops.clear()
        layer = null
        pixels = null
    }

    // Replaces every pixel: what was drawn before goes, and the color isn't
    // blended with it.
    fun eraseColor(color: Int) {
        image = null
        ops.clear()
        pixels = null
        draw(Op.Fill(color))
    }

    fun getPixels(pixels: IntArray, offset: Int, stride: Int, x: Int, y: Int, width: Int, height: Int) {
        checkRegion(x, y, width, height)
        val source = readPixels()
        for (row in 0 until height) System.arraycopy(source, (y + row) * this.width + x, pixels, offset + row * stride, width)
    }

    fun setPixels(pixels: IntArray, offset: Int, stride: Int, x: Int, y: Int, width: Int, height: Int) {
        checkRegion(x, y, width, height)
        val target = readPixels()
        for (row in 0 until height) System.arraycopy(pixels, offset + row * stride, target, (y + row) * this.width + x, width)
        image = null
        layer = null
    }

    // As Android: a region past the edge throws rather than read the next row.
    private fun checkRegion(x: Int, y: Int, width: Int, height: Int) =
        require(x >= 0 && y >= 0 && width >= 0 && height >= 0 && x + width <= this.width && y + height <= this.height) { "Region outside the bitmap" }

    private fun readPixels(): IntArray {
        check(!recycled) { "Can't read a recycled bitmap's pixels" }
        pixels?.let { return it }
        // A new bitmap is transparent: nothing for the engine to draw.
        if (image == null && ops.isEmpty()) return IntArray(width * height).also { pixels = it }
        val png = ImageEngine.render(layer(), CompressFormat.PNG, 100)
        val decoded = Png.decode(png)
        check(decoded.width == width && decoded.height == height) { "The image engine drew ${decoded.width}x${decoded.height} for ${width}x$height" }
        image = png
        ops.clear()
        layer = null
        return decoded.argb.also { pixels = it }
    }

    fun copy(config: Config, isMutable: Boolean): Bitmap = createBitmap(this, 0, 0, width, height)

    fun compress(format: CompressFormat, quality: Int, stream: OutputStream): Boolean {
        check(!recycled) { "Can't compress a recycled bitmap" }
        stream.write(ImageEngine.render(layer(), format, quality))
        return true
    }

    internal fun draw(op: Op) {
        check(!recycled) { "Can't draw on a recycled bitmap" }
        image = encoded()
        pixels = null
        ops += op
        layer = null
    }

    internal fun layer(): Layer {
        check(!recycled) { "Can't use a recycled bitmap" }
        return layer ?: Layer(width, height, encoded().also { image = it }, ops.toList()).also { layer = it }
    }

    private fun encoded(): ByteArray? = image ?: pixels?.let { Png.encode(width, height, it) }

    companion object {
        @JvmStatic
        fun createBitmap(width: Int, height: Int, config: Config): Bitmap {
            require(width > 0 && height > 0) { "width and height must be > 0" }
            return Bitmap(width, height, null)
        }

        @JvmStatic
        fun createBitmap(source: Bitmap, x: Int, y: Int, width: Int, height: Int): Bitmap =
            createBitmap(width, height, Config.ARGB_8888).also {
                val src = floatArrayOf(x.toFloat(), y.toFloat(), (x + width).toFloat(), (y + height).toFloat())
                it.draw(Op.Draw(source.layer(), src, floatArrayOf(0f, 0f, width.toFloat(), height.toFloat()), Canvas.IDENTITY))
            }

        @JvmStatic
        fun createBitmap(colors: IntArray, width: Int, height: Int, config: Config): Bitmap =
            createBitmap(width, height, config).also { it.pixels = colors.copyOf(width * height) }

        @JvmStatic
        fun createBitmap(source: Bitmap): Bitmap = createBitmap(source, 0, 0, source.width, source.height)
    }
}

/**
 * A bitmap as it was when drawn: an encoded image (drawn first, at its
 * size) and the operations after it.
 */
internal class Layer(val width: Int, val height: Int, val image: ByteArray?, val ops: List<Op>)

internal sealed interface Op {
    /**
     * [src] of [source] into [dst] (left, top, right, bottom), through
     * [matrix] as a 2D canvas's `[a, b, c, d, e, f]`.
     */
    class Draw(val source: Layer, val src: FloatArray, val dst: FloatArray, val matrix: FloatArray) : Op

    /**
     * The whole bitmap painted over with an ARGB color, as `drawColor` does
     * whatever the transform.
     */
    class Fill(val color: Int) : Op

    /**
     * One line of text at baseline [y], through [matrix]; [paint] is a copy,
     * squeezed to [maxWidth] if it's set.
     */
    class Text(val text: String, val x: Float, val y: Float, val paint: Paint, val maxWidth: Float?, val matrix: FloatArray) : Op
}
