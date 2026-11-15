package expo.modules.horizontalmultibrowsecarousel

import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.carousel.CarouselDefaults
import androidx.compose.material3.carousel.HorizontalMultiBrowseCarousel
import androidx.compose.material3.carousel.rememberCarouselState
import android.view.View
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.unit.dp
import androidx.core.view.size
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.FunctionalComposableScope
import expo.modules.ui.CarouselItemComposableScope
import expo.modules.ui.ModifierList
import expo.modules.ui.ModifierRegistry
import expo.modules.ui.PaddingValuesRecord
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withTimeoutOrNull
import androidx.compose.foundation.layout.PaddingValues

data class HorizontalMultiBrowseCarouselProps(
  val preferredItemWidth: Float = 200f,
  val itemSpacing: Float = 0f,
  val contentPadding: PaddingValuesRecord? = null,
  val minSmallItemWidth: Float? = null,
  val maxSmallItemWidth: Float? = null,
  /** Milliseconds an item rests before the next slides in; 0 never moves on. */
  val autoAdvanceInterval: Long = 0,
  val modifiers: ModifierList = emptyList()
) : ComposeProps

/**
 * @expo/ui's `HorizontalMultiBrowseCarousel`, which has no way to move it from
 * code, plus an auto-advance that waits out any drag.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FunctionalComposableScope.HorizontalMultiBrowseCarouselContent(props: HorizontalMultiBrowseCarouselProps) {
  val count = view.size
  val state = rememberCarouselState(0) { view.size }
  val interval = props.autoAdvanceInterval

  if (interval > 0 && count > 1) {
    LaunchedEffect(state, interval, count) {
      val scrolling = snapshotFlow { state.isScrollInProgress }
      while (true) {
        scrolling.first { !it }
        try {
          // A slide cut short (a tap, a pause) leaves the row between items.
          state.animateScrollToItem(state.currentItem)
        } catch (e: CancellationException) {
          ensureActive()
          continue
        }
        // A drag inside the wait starts it over, so a swipe keeps its item.
        val dragged = withTimeoutOrNull(interval) { scrolling.first { it } }
        if (dragged != null) continue
        try {
          state.animateScrollToItem((state.currentItem + 1) % count)
        } catch (e: CancellationException) {
          // A finger cancels the slide; only a dispose ends the loop.
          ensureActive()
        }
      }
    }
  }

  val minSmallItemWidth = props.minSmallItemWidth?.dp ?: CarouselDefaults.MinSmallItemSize
  val maxSmallItemWidth = (props.maxSmallItemWidth?.dp ?: CarouselDefaults.MaxSmallItemSize).coerceAtLeast(minSmallItemWidth)

  // Compose stops watching layout state while its view is detached (a screen
  // pushed over Home), so a scroll then leaves each item's mask and offset
  // stale on return: a fresh carousel re-places them from the kept state.
  val hostView = LocalView.current
  var attaches by remember { mutableIntStateOf(0) }
  DisposableEffect(hostView) {
    val listener = object : View.OnAttachStateChangeListener {
      override fun onViewAttachedToWindow(v: View) {
        attaches++
      }

      override fun onViewDetachedFromWindow(v: View) = Unit
    }
    hostView.addOnAttachStateChangeListener(listener)
    onDispose { hostView.removeOnAttachStateChangeListener(listener) }
  }

  key(attaches) {
    HorizontalMultiBrowseCarousel(
      state = state,
      preferredItemWidth = props.preferredItemWidth.dp,
      modifier = ModifierRegistry.applyModifiers(props.modifiers, appContext, composableScope, globalEventDispatcher),
      itemSpacing = props.itemSpacing.dp,
      flingBehavior = CarouselDefaults.singleAdvanceFlingBehavior(state = state),
      minSmallItemWidth = minSmallItemWidth,
      maxSmallItemWidth = maxSmallItemWidth,
      contentPadding = props.contentPadding?.toPaddingValues() ?: PaddingValues()
    ) { itemIndex ->
      Child(CarouselItemComposableScope(this), itemIndex)
    }
  }
}
