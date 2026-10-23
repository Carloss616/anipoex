package android.view

import android.content.Context
import android.content.res.Resources

/** Android's View, as far as an offscreen WebView needs: it's never attached, so layout calls do nothing. */
open class View(val context: Context?) {
    var layoutParams: ViewGroup.LayoutParams? = null

    // Never in a window, as the extensions' WebView helper expects.
    val parent: ViewParent? get() = null

    open val resources: Resources get() = Resources.getSystem()

    fun layout(l: Int, t: Int, r: Int, b: Int) {}

    fun measure(widthMeasureSpec: Int, heightMeasureSpec: Int) {}

    open fun setBackgroundColor(color: Int) {}

    // shortcut: touches are dropped, so a page that needs a tap never gets one; send them to the browser when a source needs it.
    open fun dispatchTouchEvent(event: MotionEvent?): Boolean = false

    object MeasureSpec {
        const val UNSPECIFIED = 0
        const val EXACTLY = 1 shl 30
        const val AT_MOST = 2 shl 30
        private const val MODE_MASK = 3 shl 30

        @JvmStatic
        fun makeMeasureSpec(size: Int, mode: Int): Int = (size and MODE_MASK.inv()) or (mode and MODE_MASK)

        @JvmStatic
        fun getMode(measureSpec: Int): Int = measureSpec and MODE_MASK

        @JvmStatic
        fun getSize(measureSpec: Int): Int = measureSpec and MODE_MASK.inv()
    }
}

interface ViewParent

abstract class ViewGroup(context: Context?) : View(context), ViewParent {
    open fun removeView(view: View?) {}

    open class LayoutParams(@JvmField var width: Int, @JvmField var height: Int) {
        companion object {
            const val MATCH_PARENT = -1
            const val WRAP_CONTENT = -2
        }
    }
}

/** Android's MotionEvent, so extensions can build one; [View.dispatchTouchEvent] drops it. */
class MotionEvent private constructor() {
    fun recycle() {}

    class PointerProperties {
        @JvmField var id = 0

        @JvmField var toolType = 0
    }

    class PointerCoords {
        @JvmField var x = 0f

        @JvmField var y = 0f

        @JvmField var pressure = 0f

        @JvmField var size = 0f

        @JvmField var touchMajor = 0f

        @JvmField var touchMinor = 0f

        @JvmField var toolMajor = 0f

        @JvmField var toolMinor = 0f

        @JvmField var orientation = 0f
    }

    companion object {
        @Suppress("UNUSED_PARAMETER")
        @JvmStatic
        fun obtain(
            downTime: Long,
            eventTime: Long,
            action: Int,
            pointerCount: Int,
            pointerProperties: Array<PointerProperties>?,
            pointerCoords: Array<PointerCoords>?,
            metaState: Int,
            buttonState: Int,
            xPrecision: Float,
            yPrecision: Float,
            deviceId: Int,
            edgeFlags: Int,
            source: Int,
            flags: Int,
        ): MotionEvent = MotionEvent()
    }
}
