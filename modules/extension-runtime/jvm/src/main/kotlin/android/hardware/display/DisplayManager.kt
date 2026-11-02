package android.hardware.display

import android.view.Display
import android.view.Surface

/**
 * An extension puts its WebView on a virtual display so Chromium renders it.
 * The app's browser already does, so nothing here draws.
 */
class DisplayManager {
    fun createVirtualDisplay(name: String?, width: Int, height: Int, densityDpi: Int, surface: Surface?, flags: Int): VirtualDisplay = VirtualDisplay()
}

class VirtualDisplay internal constructor() {
    val display = Display()

    fun release() {}
}
