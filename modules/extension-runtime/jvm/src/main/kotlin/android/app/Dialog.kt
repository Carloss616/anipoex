package android.app

import android.content.Context
import android.view.Display
import android.view.View
import android.view.ViewGroup

/**
 * Shows nothing. It gives its view a parent, which an extension reads back
 * after attaching a WebView to a virtual display.
 */
open class Dialog(private val context: Context?) {
    fun setContentView(view: View, params: ViewGroup.LayoutParams?) {
        view.parent = object : ViewGroup(context) {}
    }

    fun show() {}

    fun dismiss() {}
}

class Presentation(context: Context?, display: Display?) : Dialog(context)
