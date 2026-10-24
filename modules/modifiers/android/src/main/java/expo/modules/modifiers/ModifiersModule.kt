package expo.modules.modifiers

import android.graphics.Color
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.records.recordFromMap
import expo.modules.ui.ModifierRegistry
import expo.modules.ui.compose

/** Compose modifiers @expo/ui lacks, for any of its components. */
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
    }
    OnDestroy { ModifierRegistry.unregister("linearGradient") }
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
