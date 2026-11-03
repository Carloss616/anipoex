package android.text

import android.graphics.Canvas
import android.graphics.Paint

/** Android's TextPaint: a [Paint] for text. */
open class TextPaint @JvmOverloads constructor(flags: Int = 0) : Paint(flags) {
    @JvmField var bgColor = 0
}

/**
 * Android's text Layout, for sources that turn text into a page image (author notes, alt text). Lines break after
 * spaces and hyphens and around wide (CJK) characters, measured by [Paint.measureText]; spans and padding are ignored.
 */
abstract class Layout internal constructor(
    private val text: CharSequence,
    private val paint: TextPaint,
    private val width: Int,
    private val alignment: Alignment,
    spacingMult: Float,
    spacingAdd: Float,
) {
    enum class Alignment { ALIGN_NORMAL, ALIGN_OPPOSITE, ALIGN_CENTER }

    private val lines = wrap(text.toString(), paint, width.toFloat())
    private val lineHeight = paint.getFontSpacing() * spacingMult + spacingAdd

    fun getText(): CharSequence = text

    fun getWidth(): Int = width

    fun getLineCount(): Int = lines.size

    fun getHeight(): Int = Math.ceil((lines.size * lineHeight).toDouble()).toInt()

    fun draw(canvas: Canvas) {
        val (align, x) = when (alignment) {
            Alignment.ALIGN_NORMAL -> Paint.Align.LEFT to 0f
            Alignment.ALIGN_CENTER -> Paint.Align.CENTER to width / 2f
            Alignment.ALIGN_OPPOSITE -> Paint.Align.RIGHT to width.toFloat()
        }
        val linePaint = Paint(paint).apply { setTextAlign(align) }
        val ascent = -paint.getFontMetrics().ascent
        lines.forEachIndexed { i, line -> canvas.drawText(line, x, i * lineHeight + ascent, linePaint, width.toFloat()) }
    }

    internal companion object {
        /** Greedy line breaking: as many segments as fit, and a segment wider than a line breaks between characters. */
        fun wrap(text: String, paint: Paint, width: Float): List<String> = text.split('\n').flatMap { paragraph ->
            val lines = mutableListOf<String>()
            val breaks = boundaries(paragraph).iterator()
            var start = 0
            var fit = 0
            var end = if (breaks.hasNext()) breaks.next() else -1
            while (end != -1) {
                when {
                    paint.measureText(paragraph.substring(start, end).trimEnd()) <= width -> {
                        fit = end
                        end = if (breaks.hasNext()) breaks.next() else -1
                    }
                    fit > start -> {
                        lines += paragraph.substring(start, fit).trimEnd()
                        start = fit
                    }
                    else -> {
                        var cut = start + 1
                        while (cut < end && paint.measureText(paragraph.substring(start, cut + 1)) <= width) cut++
                        if (Character.isHighSurrogate(paragraph[cut - 1])) cut++
                        lines += paragraph.substring(start, cut)
                        start = cut
                        fit = cut
                    }
                }
            }
            lines += paragraph.substring(start).trimEnd()
            lines
        }

        // Not java.text.BreakIterator: its line rules are resource data the iOS JDK doesn't ship.
        private fun boundaries(text: String): List<Int> = (1..text.length).filter { i ->
            i == text.length || (text[i - 1] == ' ' && text[i] != ' ') || text[i - 1] == '-' || Paint.isWide(text[i - 1]) || Paint.isWide(text[i])
        }
    }
}

class StaticLayout @JvmOverloads constructor(
    source: CharSequence,
    paint: TextPaint,
    width: Int,
    align: Layout.Alignment? = Layout.Alignment.ALIGN_NORMAL,
    spacingMult: Float = 1f,
    spacingAdd: Float = 0f,
    includePad: Boolean = true,
) : Layout(source, paint, width, align ?: Alignment.ALIGN_NORMAL, spacingMult, spacingAdd) {
    class Builder private constructor(private val source: CharSequence, private val paint: TextPaint, private val width: Int) {
        private var alignment = Layout.Alignment.ALIGN_NORMAL
        private var spacingMult = 1f
        private var spacingAdd = 0f

        fun setAlignment(alignment: Layout.Alignment): Builder = apply { this.alignment = alignment }

        fun setLineSpacing(spacingAdd: Float, spacingMult: Float): Builder = apply {
            this.spacingAdd = spacingAdd
            this.spacingMult = spacingMult
        }

        fun setIncludePad(includePad: Boolean): Builder = this

        // shortcut: every line is kept; ellipsizing at maxLines waits for a source that sets it on a page.
        fun setMaxLines(maxLines: Int): Builder = this

        fun setBreakStrategy(breakStrategy: Int): Builder = this

        fun setHyphenationFrequency(hyphenationFrequency: Int): Builder = this

        fun build(): StaticLayout = StaticLayout(source, paint, width, alignment, spacingMult, spacingAdd)

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
