package expo.modules.modifiers

import android.graphics.Color
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.platform.rememberNestedScrollInteropConnection
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.records.recordFromMap
import expo.modules.ui.ModifierRegistry
import expo.modules.ui.compose

/** Compose modifiers @expo/ui lacks, for any of its components. */
@OptIn(ExperimentalMaterial3Api::class)
class ModifiersModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("Modifiers")

    OnCreate {
      // An RN LinearGradient needs an RNHostView, and one per grid card made
      // the manga grid jank.
      ModifierRegistry.register("linearGradient") { map, _, context, _ ->
        val params = recordFromMap<LinearGradientParams>(map, context)
        val colors = params.colors.map { it.compose }
        if (colors.size < 2) return@register Modifier
        val stops = params.locations?.takeIf { it.size == colors.size }?.zip(colors)
          ?: colors.mapIndexed { i, color -> i / (colors.size - 1f) to color }
        Modifier.drawBehind {
          val start = Offset(params.startPoint.x * size.width, params.startPoint.y * size.height)
          val end = Offset(params.endPoint.x * size.width, params.endPoint.y * size.height)
          drawRect(Brush.linearGradient(*stops.toTypedArray(), start = start, end = end))
        }
      }

      // M3's pinned bar behavior, reporting only whether the content scrolled
      // under it: a bar in another Host can't take the connection itself.
      ModifierRegistry.register("pinnedScrollBehavior") { _, _, _, dispatch ->
        val behavior = TopAppBarDefaults.pinnedScrollBehavior()
        // A pixel of slack: the summed scroll deltas may not land on zero.
        val scrolled by remember { derivedStateOf { behavior.state.contentOffset < -1f } }
        LaunchedEffect(scrolled) { dispatch("pinnedScrollBehavior", mapOf("scrolled" to scrolled)) }
        Modifier.nestedScroll(behavior.nestedScrollConnection)
      }

      // A Compose list in a native form sheet: hands the sheet's behavior the
      // scroll the list leaves, or both take the same drag.
      // https://developer.android.com/develop/ui/compose/touch-input/pointer-input/scroll#compose-in-view
      ModifierRegistry.register("nestedScrollInteropConnection") { _, _, _, _ ->
        Modifier.nestedScroll(rememberNestedScrollInteropConnection())
      }
    }
    OnDestroy {
      ModifierRegistry.unregister("linearGradient")
      ModifierRegistry.unregister("pinnedScrollBehavior")
      ModifierRegistry.unregister("nestedScrollInteropConnection")
    }
  }
}

// SwiftUI's unit points: 0–1 of the width and height.
data class UnitPoint(@Field val x: Float = 0.5f, @Field val y: Float = 0f) : Record

data class LinearGradientParams(
  @Field val colors: List<Color> = emptyList(),
  // Evenly spread when left out.
  @Field val locations: List<Float>? = null,
  @Field val startPoint: UnitPoint = UnitPoint(0.5f, 0f),
  @Field val endPoint: UnitPoint = UnitPoint(0.5f, 1f)
) : Record
