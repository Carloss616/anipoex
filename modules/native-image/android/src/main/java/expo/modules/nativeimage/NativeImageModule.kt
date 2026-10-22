package expo.modules.nativeimage

import android.graphics.Bitmap
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.BlurredEdgeTreatment
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import com.bumptech.glide.Glide
import com.bumptech.glide.load.DataSource
import com.bumptech.glide.load.engine.GlideException
import com.bumptech.glide.load.model.GlideUrl
import com.bumptech.glide.load.model.LazyHeaders
import com.bumptech.glide.request.RequestListener
import com.bumptech.glide.request.target.Target
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.FunctionalComposableScope
import expo.modules.ui.ExpoUIView
import expo.modules.ui.ModifierList
import expo.modules.ui.ModifierRegistry
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runInterruptible

class NativeImageModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NativeImage")

    ExpoUIView<ImageViewProps>("ImageView") {
      val onLoad by Event<LoadEvent>()
      val onError by Event<ErrorEvent>()
      Content { props -> ImageContent(props, { onLoad(it) }, { onError(it) }) }
    }
  }
}

data class ImageSource(
  @Field val uri: String? = null,
  @Field val headers: Map<String, String>? = null
) : Record

data class ImageViewProps(
  val source: ImageSource? = null,
  val contentFit: String = "cover",
  val transition: Double = 250.0,
  val blurRadius: Double = 0.0,
  val modifiers: ModifierList = emptyList()
) : ComposeProps

// expo-image's load and error events, so a screen moves here by its import.
data class LoadedSource(
  @Field val url: String = "",
  @Field val width: Int = 0,
  @Field val height: Int = 0,
  @Field val mediaType: String? = null
) : Record

data class LoadEvent(@Field val cacheType: String = "none", @Field val source: LoadedSource = LoadedSource()) : Record

data class ErrorEvent(@Field val error: String = "") : Record

private class Loaded(val url: String, val bitmap: ImageBitmap, val fade: Boolean)

/**
 * An image from an https or data URL, loaded and cached by Glide (expo-image's
 * engine) at the size it's drawn: @expo/ui's Image decodes at full size, and a
 * source's oversized cover is a bitmap too large to draw, which kills the app.
 * Draws nothing until it has a size.
 */
@Composable
fun FunctionalComposableScope.ImageContent(
  props: ImageViewProps,
  onLoad: (LoadEvent) -> Unit,
  onError: (ErrorEvent) -> Unit
) {
  val context = LocalContext.current.applicationContext
  val url = props.source?.uri
  var size by remember { mutableStateOf(IntSize.Zero) }
  var loaded by remember { mutableStateOf<Loaded?>(null) }
  val alpha = remember { Animatable(0f) }

  LaunchedEffect(url, props.source?.headers, size) {
    if (url == null || size == IntSize.Zero || loaded?.url == url) return@LaunchedEffect
    val model = props.source?.headers?.takeIf { it.isNotEmpty() }?.let { headers ->
      GlideUrl(url, LazyHeaders.Builder().apply { headers.forEach { (name, value) -> addHeader(name, value) } }.build())
    } ?: url
    var from: DataSource? = null
    // Glide downsamples to this size, so the bitmap is never bigger than the view.
    val target = Glide.with(context).asBitmap().load(model)
      .listener(object : RequestListener<Bitmap> {
        override fun onLoadFailed(e: GlideException?, model: Any?, target: Target<Bitmap>, isFirstResource: Boolean) = false

        override fun onResourceReady(
          resource: Bitmap,
          model: Any,
          target: Target<Bitmap>?,
          dataSource: DataSource,
          isFirstResource: Boolean
        ): Boolean {
          from = dataSource
          return false
        }
      })
      .submit(size.width, size.height)
    val bitmap = try {
      runInterruptible(Dispatchers.IO) { target.get() }
    } catch (e: CancellationException) {
      target.cancel(true)
      throw e
    } catch (e: Exception) {
      onError(ErrorEvent(e.cause?.message ?: e.message ?: "Could not load the image"))
      return@LaunchedEffect
    }
    // A memory hit draws at once, so a row scrolled back into view doesn't fade in again.
    loaded = Loaded(url, bitmap.asImageBitmap(), fade = from != DataSource.MEMORY_CACHE && props.transition > 0)
    onLoad(
      LoadEvent(
        cacheType = when (from) {
          DataSource.MEMORY_CACHE -> "memory"
          DataSource.DATA_DISK_CACHE, DataSource.RESOURCE_DISK_CACHE -> "disk"
          else -> "none"
        },
        source = LoadedSource(url, bitmap.width, bitmap.height)
      )
    )
  }

  // Apart from the load: a size change restarts that effect, and must not stop a fade halfway.
  LaunchedEffect(loaded) {
    val shown = loaded ?: return@LaunchedEffect
    alpha.snapTo(if (shown.fade) 0f else 1f)
    if (shown.fade) alpha.animateTo(1f, tween(props.transition.toInt()))
  }

  Box(
    ModifierRegistry.applyModifiers(props.modifiers, appContext, composableScope, globalEventDispatcher)
      .onSizeChanged { size = it }
      .clipToBounds()
  ) {
    loaded?.takeIf { it.url == url }?.let { shown ->
      Image(
        bitmap = shown.bitmap,
        contentDescription = null,
        contentScale = when (props.contentFit) {
          "contain" -> ContentScale.Fit
          "fill" -> ContentScale.FillBounds
          else -> ContentScale.Crop
        },
        alpha = alpha.value,
        // Opaque edges, as on iOS: a blurred cover keeps filling its frame.
        modifier = Modifier.matchParentSize().let {
          if (props.blurRadius > 0) it.blur(props.blurRadius.dp, BlurredEdgeTreatment.Rectangle) else it
        }
      )
    }
  }
}
