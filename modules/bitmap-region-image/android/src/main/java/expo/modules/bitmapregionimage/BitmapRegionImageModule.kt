package expo.modules.bitmapregionimage

import android.graphics.BitmapFactory
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.net.URI

internal fun fileOf(uri: String) = File(URI(uri))

class BitmapRegionImageModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("BitmapRegionImage")

    // Reads only the header, so a page gets its height before any pixel is decoded.
    AsyncFunction("size") { uri: String ->
      val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
      BitmapFactory.decodeFile(fileOf(uri).path, options)
      if (options.outWidth <= 0) throw CodedException("Can't read the image at $uri")
      mapOf("width" to options.outWidth, "height" to options.outHeight)
    }

    View(BitmapRegionImageView::class) {
      Events("onError")
      Prop("uri") { view: BitmapRegionImageView, uri: String -> view.uri = uri }
      Prop("regionTop") { view: BitmapRegionImageView, top: Int -> view.regionTop = top }
      Prop("regionHeight") { view: BitmapRegionImageView, height: Int -> view.regionHeight = height }
      OnViewDidUpdateProps { view: BitmapRegionImageView -> view.load() }
    }
  }
}
