package android.graphics

import kotlin.math.cos
import kotlin.math.sin

/** Android's Canvas over a [Bitmap]: each draw is recorded with the transform at that moment. */
class Canvas(private val bitmap: Bitmap) {
    // As a 2D canvas's setTransform(a, b, c, d, e, f); replaced, never changed in place, so ops can keep it.
    private var matrix = IDENTITY
    private val saved = ArrayDeque<FloatArray>()

    fun getWidth(): Int = bitmap.getWidth()

    fun getHeight(): Int = bitmap.getHeight()

    fun save(): Int {
        saved.addLast(matrix)
        return saved.size
    }

    fun restore() {
        matrix = saved.removeLastOrNull() ?: throw IllegalStateException("Underflow in restore")
    }

    fun getSaveCount(): Int = saved.size + 1

    fun restoreToCount(saveCount: Int) {
        while (saved.size >= saveCount) restore()
    }

    fun translate(dx: Float, dy: Float) = concat(1f, 0f, 0f, 1f, dx, dy)

    fun scale(sx: Float, sy: Float) = concat(sx, 0f, 0f, sy, 0f, 0f)

    fun rotate(degrees: Float) {
        val radians = Math.toRadians(degrees.toDouble())
        val c = cos(radians).toFloat()
        val s = sin(radians).toFloat()
        concat(c, s, -s, c, 0f, 0f)
    }

    fun rotate(degrees: Float, px: Float, py: Float) {
        translate(px, py)
        rotate(degrees)
        translate(-px, -py)
    }

    fun drawColor(color: Int) = bitmap.draw(Op.Fill(color))

    fun drawBitmap(bitmap: Bitmap, src: Rect?, dst: Rect, paint: Paint?) =
        draw(bitmap, src, floatArrayOf(dst.left.toFloat(), dst.top.toFloat(), dst.right.toFloat(), dst.bottom.toFloat()))

    fun drawBitmap(bitmap: Bitmap, src: Rect?, dst: RectF, paint: Paint?) =
        draw(bitmap, src, floatArrayOf(dst.left, dst.top, dst.right, dst.bottom))

    fun drawBitmap(bitmap: Bitmap, left: Float, top: Float, paint: Paint?) =
        draw(bitmap, null, floatArrayOf(left, top, left + bitmap.getWidth(), top + bitmap.getHeight()))

    // shortcut: the app's image engine draws bitmaps only, so a page a source draws text or shapes on fails
    // here instead of coming out blank; add ops to ImageEngine and the hosts when a source needs one.
    fun drawText(text: String, x: Float, y: Float, paint: Paint): Unit = unsupported("text")

    fun drawLine(startX: Float, startY: Float, stopX: Float, stopY: Float, paint: Paint): Unit = unsupported("lines")

    fun drawCircle(cx: Float, cy: Float, radius: Float, paint: Paint): Unit = unsupported("circles")

    fun drawPath(path: Path, paint: Paint): Unit = unsupported("paths")

    fun drawRoundRect(rect: RectF, rx: Float, ry: Float, paint: Paint): Unit = unsupported("shapes")

    private fun draw(source: Bitmap, src: Rect?, dst: FloatArray) {
        val from = src?.let { floatArrayOf(it.left.toFloat(), it.top.toFloat(), it.right.toFloat(), it.bottom.toFloat()) }
            ?: floatArrayOf(0f, 0f, source.getWidth().toFloat(), source.getHeight().toFloat())
        bitmap.draw(Op.Draw(source.layer(), from, dst, matrix))
    }

    private fun concat(a: Float, b: Float, c: Float, d: Float, e: Float, f: Float) {
        val m = matrix
        matrix = floatArrayOf(
            m[0] * a + m[2] * b, m[1] * a + m[3] * b,
            m[0] * c + m[2] * d, m[1] * c + m[3] * d,
            m[0] * e + m[2] * f + m[4], m[1] * e + m[3] * f + m[5],
        )
    }

    internal companion object {
        fun unsupported(what: String): Nothing = throw UnsupportedOperationException("Drawing $what isn't supported on this device")

        val IDENTITY = floatArrayOf(1f, 0f, 0f, 1f, 0f, 0f)
    }
}
