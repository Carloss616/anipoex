package android.text

import android.graphics.Canvas
import android.graphics.Paint

/** Android's TextPaint: a [Paint] for text, which nothing draws here. */
open class TextPaint @JvmOverloads constructor(flags: Int = 0) : Paint(flags) {
    @JvmField var bgColor = 0
}

/**
 * Android's text Layout, for sources that turn text into a page image (author notes, alt text). Line breaks follow
 * the text's own newlines at an estimated line height, since no font is loaded to measure it, and [draw] fails: the
 * app's image engine draws no text (see [Canvas.drawText]).
 */
abstract class Layout internal constructor(private val text: CharSequence, private val paint: TextPaint, private val width: Int) {
    enum class Alignment { ALIGN_NORMAL, ALIGN_OPPOSITE, ALIGN_CENTER }

    fun getText(): CharSequence = text

    fun getWidth(): Int = width

    fun getLineCount(): Int = text.count { it == '\n' } + 1

    fun getHeight(): Int = Math.ceil((getLineCount() * paint.getFontSpacing()).toDouble()).toInt()

    fun draw(canvas: Canvas): Unit = Canvas.unsupported("text")
}

class StaticLayout @JvmOverloads constructor(
    source: CharSequence,
    paint: TextPaint,
    width: Int,
    align: Layout.Alignment? = Layout.Alignment.ALIGN_NORMAL,
    spacingMult: Float = 1f,
    spacingAdd: Float = 0f,
    includePad: Boolean = true,
) : Layout(source, paint, width) {
    class Builder private constructor(private val source: CharSequence, private val paint: TextPaint, private val width: Int) {
        fun setAlignment(alignment: Layout.Alignment): Builder = this

        fun setLineSpacing(spacingAdd: Float, spacingMult: Float): Builder = this

        fun setIncludePad(includePad: Boolean): Builder = this

        fun setMaxLines(maxLines: Int): Builder = this

        fun setBreakStrategy(breakStrategy: Int): Builder = this

        fun setHyphenationFrequency(hyphenationFrequency: Int): Builder = this

        fun build(): StaticLayout = StaticLayout(source, paint, width)

        companion object {
            @JvmStatic
            fun obtain(source: CharSequence, start: Int, end: Int, paint: TextPaint, width: Int): Builder =
                Builder(source.subSequence(start, end), paint, width)
        }
    }
}

/** Android's editable text, for the input a source's login dialog reads; that dialog never shows here. */
interface Editable : CharSequence

interface TextWatcher {
    fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int)

    fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int)

    fun afterTextChanged(s: Editable?)
}
