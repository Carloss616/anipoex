package android.graphics

/**
 * Android's Paint. Drawing a bitmap ignores it, as a null paint does; it keeps what a source sets so it can read it back,
 * but nothing paints with it: text and shapes aren't drawn here (see [Canvas.drawText]).
 */
open class Paint @JvmOverloads constructor(flags: Int = 0) {
    private var color = 0xFF000000.toInt()
    private var textSize = 12f
    private var style = Style.FILL

    constructor(paint: Paint) : this() {
        set(paint)
    }

    fun set(paint: Paint) {
        color = paint.color
        textSize = paint.textSize
        style = paint.style
    }

    fun getColor(): Int = color

    fun setColor(color: Int) {
        this.color = color
    }

    fun setAlpha(alpha: Int) {
        color = (color and 0x00FFFFFF) or (alpha.coerceIn(0, 255) shl 24)
    }

    fun getTextSize(): Float = textSize

    fun setTextSize(textSize: Float) {
        this.textSize = textSize
    }

    fun getStyle(): Style = style

    fun setStyle(style: Style) {
        this.style = style
    }

    // Line height with the default font's proportions: no font is loaded to measure.
    fun getFontSpacing(): Float = textSize * 1.17f

    fun getFontMetrics(): FontMetrics = FontMetrics().apply {
        top = -textSize * 1.06f
        ascent = -textSize * 0.93f
        descent = textSize * 0.24f
        bottom = textSize * 0.27f
    }

    fun setAntiAlias(antiAlias: Boolean) {}

    fun setFilterBitmap(filter: Boolean) {}

    fun setStrokeWidth(width: Float) {}

    fun setStrokeCap(cap: Cap) {}

    fun setStrokeJoin(join: Join) {}

    fun setStrokeMiter(miter: Float) {}

    fun setTextAlign(align: Align) {}

    fun setTextScaleX(scaleX: Float) {}

    fun setLetterSpacing(letterSpacing: Float) {}

    fun setTypeface(typeface: Typeface?): Typeface? = typeface

    fun setColorFilter(filter: ColorFilter?): ColorFilter? = filter

    enum class Style { FILL, STROKE, FILL_AND_STROKE }

    enum class Cap { BUTT, ROUND, SQUARE }

    enum class Join { MITER, ROUND, BEVEL }

    enum class Align { LEFT, CENTER, RIGHT }

    open class FontMetrics {
        @JvmField var top = 0f

        @JvmField var ascent = 0f

        @JvmField var descent = 0f

        @JvmField var bottom = 0f

        @JvmField var leading = 0f
    }

    companion object {
        const val ANTI_ALIAS_FLAG = 1
        const val FILTER_BITMAP_FLAG = 2
    }
}

/** Android's Typeface: a name for the font a source asks for; no font is loaded. */
class Typeface private constructor(val style: Int) {
    companion object {
        const val NORMAL = 0
        const val BOLD = 1
        const val ITALIC = 2
        const val BOLD_ITALIC = 3

        @JvmField val DEFAULT = Typeface(NORMAL)

        @JvmField val DEFAULT_BOLD = Typeface(BOLD)

        @JvmField val SANS_SERIF = Typeface(NORMAL)

        @JvmField val SERIF = Typeface(NORMAL)

        @JvmField val MONOSPACE = Typeface(NORMAL)

        @JvmStatic
        fun create(family: Typeface?, style: Int): Typeface = Typeface(style)

        @JvmStatic
        fun create(familyName: String?, style: Int): Typeface = Typeface(style)

        @JvmStatic
        fun createFromFile(file: java.io.File?): Typeface = Typeface(NORMAL)

        @JvmStatic
        fun defaultFromStyle(style: Int): Typeface = Typeface(style)
    }
}

open class ColorFilter

/** Android's Path: points a source adds, which [Canvas.drawPath] can't draw. */
class Path {
    fun moveTo(x: Float, y: Float) {}

    fun lineTo(x: Float, y: Float) {}

    fun quadTo(x1: Float, y1: Float, x2: Float, y2: Float) {}

    fun cubicTo(x1: Float, y1: Float, x2: Float, y2: Float, x3: Float, y3: Float) {}

    fun close() {}

    fun reset() {}
}

/** Android's Color helpers. */
object Color {
    const val BLACK = 0xFF000000.toInt()
    const val WHITE = 0xFFFFFFFF.toInt()
    const val TRANSPARENT = 0
    const val RED = 0xFFFF0000.toInt()
    const val GREEN = 0xFF00FF00.toInt()
    const val BLUE = 0xFF0000FF.toInt()
    const val GRAY = 0xFF888888.toInt()
    const val LTGRAY = 0xFFCCCCCC.toInt()
    const val DKGRAY = 0xFF444444.toInt()
    const val YELLOW = 0xFFFFFF00.toInt()

    @JvmStatic
    fun argb(alpha: Int, red: Int, green: Int, blue: Int): Int = (alpha shl 24) or (red shl 16) or (green shl 8) or blue

    @JvmStatic
    fun rgb(red: Int, green: Int, blue: Int): Int = argb(0xFF, red, green, blue)

    @JvmStatic
    fun alpha(color: Int): Int = color ushr 24

    @JvmStatic
    fun red(color: Int): Int = (color shr 16) and 0xFF

    @JvmStatic
    fun green(color: Int): Int = (color shr 8) and 0xFF

    @JvmStatic
    fun blue(color: Int): Int = color and 0xFF

    // shortcut: hex only, where Android also takes names ("white"); add them when a source passes one.
    @JvmStatic
    fun parseColor(colorString: String): Int {
        require(colorString.startsWith("#") && (colorString.length == 7 || colorString.length == 9)) { "Unknown color" }
        val value = colorString.substring(1).toLong(16).toInt()
        return if (colorString.length == 7) value or BLACK else value
    }
}

/** Android's ColorMatrix: a source can build one, but no paint applies it here. */
class ColorMatrix() {
    constructor(src: FloatArray) : this()

    fun setSaturation(sat: Float) {}

    fun set(src: FloatArray) {}
}

class ColorMatrixColorFilter(matrix: ColorMatrix) : ColorFilter()
