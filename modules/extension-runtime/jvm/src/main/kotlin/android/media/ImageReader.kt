package android.media

import android.os.Handler
import android.view.Surface

/** Receives a virtual display's frames (see DisplayManager), so it never has any. */
class ImageReader private constructor() {
    val surface = Surface()

    fun acquireLatestImage(): Image? = null

    fun setOnImageAvailableListener(listener: OnImageAvailableListener?, handler: Handler?) {}

    fun close() {}

    fun interface OnImageAvailableListener {
        fun onImageAvailable(reader: ImageReader?)
    }

    companion object {
        @JvmStatic
        fun newInstance(width: Int, height: Int, format: Int, maxImages: Int) = ImageReader()
    }
}

class Image internal constructor() {
    fun close() {}
}
