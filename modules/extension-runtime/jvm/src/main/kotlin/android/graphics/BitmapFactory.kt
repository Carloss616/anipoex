package android.graphics

import anipoex.server.ImageEngine
import java.io.InputStream

/** Android's BitmapFactory: "decoding" reads the size from the image's header and keeps its bytes for the app's engine. */
object BitmapFactory {
    class Options {
        @JvmField var inMutable = false
        @JvmField var inJustDecodeBounds = false
        @JvmField var inPreferredConfig: Bitmap.Config? = Bitmap.Config.ARGB_8888
        @JvmField var outWidth = -1
        @JvmField var outHeight = -1
    }

    @JvmStatic
    fun decodeByteArray(data: ByteArray, offset: Int, length: Int): Bitmap? = decodeByteArray(data, offset, length, null)

    @JvmStatic
    fun decodeByteArray(data: ByteArray, offset: Int, length: Int, opts: Options?): Bitmap? =
        decode(data.copyOfRange(offset, offset + length), opts)

    @JvmStatic
    fun decodeStream(stream: InputStream?): Bitmap? = decodeStream(stream, null, null)

    @JvmStatic
    fun decodeStream(stream: InputStream?, outPadding: Rect?, opts: Options?): Bitmap? = stream?.let { decode(it.readBytes(), opts) }

    // Android answers null for bytes it can't decode, as here for a format whose header isn't read.
    private fun decode(bytes: ByteArray, opts: Options?): Bitmap? {
        val (width, height) = ImageEngine.size(bytes) ?: return null
        opts?.outWidth = width
        opts?.outHeight = height
        if (opts?.inJustDecodeBounds == true) return null
        return Bitmap(width, height, bytes)
    }
}
