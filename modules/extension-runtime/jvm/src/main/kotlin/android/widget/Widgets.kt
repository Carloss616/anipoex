package android.widget

import android.content.Context
import android.text.Editable
import android.text.TextWatcher
import android.text.method.TransformationMethod
import android.view.View
import android.view.ViewGroup

// The views a source's login or captcha dialog builds. That dialog never shows here (see android.app.Dialog), so
// they hold nothing and never fire.

open class TextView(context: Context?) : View(context) {
    open fun setText(text: CharSequence?) {}

    open fun getText(): CharSequence = ""

    fun setHint(hint: CharSequence?) {}

    fun setTextSize(size: Float) {}

    fun setTextColor(color: Int) {}

    fun setSingleLine(singleLine: Boolean) {}

    fun setInputType(type: Int) {}

    fun setTransformationMethod(method: TransformationMethod?) {}

    fun addTextChangedListener(watcher: TextWatcher?) {}

    fun setHorizontallyScrolling(whether: Boolean) {}

    fun getCurrentTextColor(): Int = 0xFF000000.toInt()

    fun getSelectionStart(): Int = 0

    fun getSelectionEnd(): Int = 0
}

open class EditText(context: Context?) : TextView(context) {
    override fun getText(): Editable = Text

    fun setSelection(index: Int) {}

    fun setSelection(start: Int, stop: Int) {}

    fun selectAll() {}

    private object Text : Editable, CharSequence by "" {
        override fun toString() = ""
    }
}

open class Button(context: Context?) : TextView(context)

open class ImageView(context: Context?) : View(context) {
    fun setImageBitmap(bitmap: android.graphics.Bitmap?) {}

    fun setImageDrawable(drawable: android.graphics.drawable.Drawable?) {}

    fun setScaleType(scaleType: ScaleType?) {}

    enum class ScaleType { MATRIX, FIT_XY, FIT_START, FIT_CENTER, FIT_END, CENTER, CENTER_CROP, CENTER_INSIDE }
}

open class LinearLayout(context: Context?) : ViewGroup(context) {
    fun setOrientation(orientation: Int) {}

    companion object {
        const val HORIZONTAL = 0
        const val VERTICAL = 1
    }
}

open class FrameLayout(context: Context?) : ViewGroup(context) {
    open class LayoutParams @JvmOverloads constructor(width: Int, height: Int, @JvmField var gravity: Int = -1) :
        ViewGroup.MarginLayoutParams(width, height)
}
