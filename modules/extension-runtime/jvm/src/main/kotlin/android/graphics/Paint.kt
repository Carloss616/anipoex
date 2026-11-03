package android.graphics

/**
 * Android's Paint. Drawing a bitmap ignores it, as a null paint does; text takes its color, size, bold, alignment and
 * style (see [Canvas.drawText]). Text is measured in Helvetica, the font the app's engine draws it in.
 */
open class Paint @JvmOverloads constructor(flags: Int = 0) {
    private var color = 0xFF000000.toInt()
    private var textSize = 12f
    private var style = Style.FILL
    private var strokeWidth = 0f
    private var textAlign = Align.LEFT
    private var typeface: Typeface? = null

    constructor(paint: Paint) : this() {
        set(paint)
    }

    fun set(paint: Paint) {
        color = paint.color
        textSize = paint.textSize
        style = paint.style
        strokeWidth = paint.strokeWidth
        textAlign = paint.textAlign
        typeface = paint.typeface
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

    fun getStrokeWidth(): Float = strokeWidth

    fun setStrokeWidth(width: Float) {
        strokeWidth = width
    }

    fun setStrokeCap(cap: Cap) {}

    fun setStrokeJoin(join: Join) {}

    fun setStrokeMiter(miter: Float) {}

    fun getTextAlign(): Align = textAlign

    fun setTextAlign(align: Align) {
        textAlign = align
    }

    fun setTextScaleX(scaleX: Float) {}

    fun setLetterSpacing(letterSpacing: Float) {}

    fun getTypeface(): Typeface? = typeface

    fun setTypeface(typeface: Typeface?): Typeface? {
        this.typeface = typeface
        return typeface
    }

    internal fun isBold(): Boolean = (typeface?.style ?: 0) and Typeface.BOLD != 0

    fun measureText(text: String): Float {
        var width = 0
        for (c in text) width += when {
            c.code in 32..126 -> HELVETICA[c.code - 32]
            Character.getType(c) == Character.NON_SPACING_MARK.toInt() -> 0
            isWide(c) -> 1000
            else -> 556
        }
        // Helvetica Bold's letters run about 7% wider.
        return width * textSize / 1000 * (if (isBold()) 1.07f else 1f)
    }

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

        // East Asian wide characters: CJK, kana, hangul, fullwidth forms.
        internal fun isWide(c: Char): Boolean = c.code in 0x2E80..0xA4CF || c.code in 0xAC00..0xD7A3 || c.code in 0xFF00..0xFF60

        // Helvetica's advance widths for ' ' to '~', in 1/1000 em.
        private val HELVETICA = intArrayOf(
            278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
            556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
            1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
            667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
            333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
            556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
        )
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
