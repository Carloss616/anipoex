package android.app

import android.content.Context
import android.content.DialogInterface
import android.view.Display
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.widget.Button

/**
 * Shows nothing. It gives its view a parent, which an extension reads back
 * after attaching a WebView to a virtual display.
 */
open class Dialog @JvmOverloads constructor(private val context: Context?, themeResId: Int = 0) : DialogInterface {
    private val window = Window()

    fun getWindow(): Window = window

    @JvmOverloads
    fun setContentView(view: View, params: ViewGroup.LayoutParams? = null) {
        view.parent = object : ViewGroup(context) {}
    }

    fun setOnCancelListener(listener: DialogInterface.OnCancelListener?) {}

    fun setOnDismissListener(listener: DialogInterface.OnDismissListener?) {}

    fun setCancelable(cancelable: Boolean) {}

    fun isShowing(): Boolean = false

    open fun show() {}

    override fun dismiss() {}

    override fun cancel() {}
}

class Presentation(context: Context?, display: Display?) : Dialog(context)

/** Like [Dialog], it never shows, so its buttons are never pressed. */
class AlertDialog(context: Context?) : Dialog(context) {
    fun getButton(whichButton: Int): Button = Button(null)

    class Builder(private val context: Context?) {
        fun setTitle(title: CharSequence?): Builder = this

        fun setMessage(message: CharSequence?): Builder = this

        fun setView(view: View?): Builder = this

        fun setCancelable(cancelable: Boolean): Builder = this

        fun setPositiveButton(text: CharSequence?, listener: DialogInterface.OnClickListener?): Builder = this

        fun setNegativeButton(text: CharSequence?, listener: DialogInterface.OnClickListener?): Builder = this

        fun setPositiveButton(textId: Int, listener: DialogInterface.OnClickListener?): Builder = this

        fun setNegativeButton(textId: Int, listener: DialogInterface.OnClickListener?): Builder = this

        fun setNeutralButton(text: CharSequence?, listener: DialogInterface.OnClickListener?): Builder = this

        fun setOnCancelListener(listener: DialogInterface.OnCancelListener?): Builder = this

        fun setOnDismissListener(listener: DialogInterface.OnDismissListener?): Builder = this

        fun create(): AlertDialog = AlertDialog(context)

        fun show(): AlertDialog = create()
    }
}
