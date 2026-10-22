package android.graphics

import anipoex.server.ImageEngine
import java.io.OutputStream

/**
 * Android's Bitmap without pixels: the image it was decoded from plus what was drawn on it, which the app's own engine
 * renders on [compress] (see [ImageEngine]). Enough for sources that cut a page into tiles and put them back in order.
 */
class Bitmap internal constructor(private val width: Int, private val height: Int, private var image: ByteArray?) {
    enum class Config { ALPHA_8, RGB_565, ARGB_4444, ARGB_8888, RGBA_F16, HARDWARE, RGBA_1010102 }

    enum class CompressFormat { JPEG, PNG, WEBP, WEBP_LOSSY, WEBP_LOSSLESS }

    private val ops = mutableListOf<Op>()
    // What it looks like now, kept until it's drawn on again so a source drawn tile by tile is sent once.
    private var layer: Layer? = null
    private var recycled = false

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
    }

    fun copy(config: Config, isMutable: Boolean): Bitmap = createBitmap(this, 0, 0, width, height)

    fun compress(format: CompressFormat, quality: Int, stream: OutputStream): Boolean {
        check(!recycled) { "Can't compress a recycled bitmap" }
        stream.write(ImageEngine.render(layer(), format, quality))
        return true
    }

    internal fun draw(op: Op) {
        check(!recycled) { "Can't draw on a recycled bitmap" }
        ops += op
        layer = null
    }

    internal fun layer(): Layer {
        check(!recycled) { "Can't use a recycled bitmap" }
        return layer ?: Layer(width, height, image, ops.toList()).also { layer = it }
    }

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
        fun createBitmap(source: Bitmap): Bitmap = createBitmap(source, 0, 0, source.width, source.height)
    }
}

/** A bitmap as it was when drawn: an encoded image (drawn first, at its size) and the operations after it. */
internal class Layer(val width: Int, val height: Int, val image: ByteArray?, val ops: List<Op>)

internal sealed interface Op {
    /** [src] of [source] into [dst] (left, top, right, bottom), through [matrix] as a 2D canvas's `[a, b, c, d, e, f]`. */
    class Draw(val source: Layer, val src: FloatArray, val dst: FloatArray, val matrix: FloatArray) : Op

    /** The whole bitmap painted over with an ARGB color, as `drawColor` does whatever the transform. */
    class Fill(val color: Int) : Op
}
