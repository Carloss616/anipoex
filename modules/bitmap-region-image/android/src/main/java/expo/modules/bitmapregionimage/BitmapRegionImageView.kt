package expo.modules.bitmapregionimage

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.BitmapRegionDecoder
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Rect
import android.os.Build
import android.util.LruCache
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import java.io.IOException
import java.util.concurrent.Executors
import java.util.concurrent.Future
import kotlin.math.min

private val executor = Executors.newFixedThreadPool(2)

// The slices of one page share its decoder: a JPEG's is built by reading the
// whole file.
private val decoders = LruCache<String, BitmapRegionDecoder>(4)

private fun decoder(uri: String): BitmapRegionDecoder {
  synchronized(decoders) { decoders[uri] }?.let { return it }
  val path = fileOf(uri).path
  val decoder =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) BitmapRegionDecoder.newInstance(path)
    else @Suppress("DEPRECATION") BitmapRegionDecoder.newInstance(path, false)
      ?: throw IOException("Can't open $uri")
  synchronized(decoders) { decoders.put(uri, decoder) }
  return decoder
}

/**
 * Rows `top` to `top + height` of the image, halved while it stays at least
 * `targetWidth` wide.
 */
private fun decode(uri: String, top: Int, height: Int, targetWidth: Int): Bitmap {
  val decoder = decoder(uri)
  var sample = 1
  while (decoder.width / (sample * 2) >= targetWidth) sample *= 2
  val options = BitmapFactory.Options().apply { inSampleSize = sample }
  val rect = Rect(0, top, decoder.width, min(top + height, decoder.height))
  return decoder.decodeRegion(rect, options) ?: throw IOException("Can't decode $uri")
}

/**
 * One horizontal band of a local image, stretched to the view. A tall page
 * shown as several bands never holds the whole image in memory, nor uploads it
 * to the GPU as one texture. Mihon's reader decodes tall pages by region too:
 * https://github.com/mihonapp/mihon/blob/main/app/src/main/java/eu/kanade/tachiyomi/ui/reader/viewer/ReaderPageImageView.kt
 */
class BitmapRegionImageView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val onError by EventDispatcher()
  var uri: String? = null
  var regionTop = 0
  var regionHeight = 0
  private var bitmap: Bitmap? = null
  // The band drawn or being decoded, so a prop update with the same band
  // doesn't decode it again.
  private var shown: String? = null
  private var task: Future<*>? = null
  private val bounds = Rect()
  private val paint = Paint(Paint.FILTER_BITMAP_FLAG)

  init {
    setWillNotDraw(false)
  }

  fun load() {
    val uri = uri ?: return
    if (width == 0 || regionHeight <= 0 || !isAttachedToWindow) return
    val key = "$uri#$regionTop+$regionHeight"
    if (key == shown) return
    shown = key
    task?.cancel(true)
    val top = regionTop
    val height = regionHeight
    val targetWidth = width
    task = executor.submit {
      try {
        val decoded = decode(uri, top, height, targetWidth)
        post {
          if (shown == key) {
            bitmap = decoded
            invalidate()
          }
        }
      } catch (error: Exception) {
        post { if (shown == key) onError(mapOf("message" to (error.message ?: error.toString()))) }
      }
    }
  }

  override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)
    load()
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    load()
  }

  // A list drops its far rows: their pixels go with them, and come back on
  // reattach.
  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    task?.cancel(true)
    shown = null
    bitmap = null
  }

  override fun onDraw(canvas: Canvas) {
    super.onDraw(canvas)
    val bitmap = bitmap ?: return
    bounds.set(0, 0, width, height)
    canvas.drawBitmap(bitmap, null, bounds, paint)
  }
}
