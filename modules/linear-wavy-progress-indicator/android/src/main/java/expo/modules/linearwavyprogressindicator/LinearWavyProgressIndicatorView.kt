package expo.modules.linearwavyprogressindicator

import android.graphics.Color
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.material3.ExperimentalMaterial3ExpressiveApi
import androidx.compose.material3.LinearWavyProgressIndicator
import androidx.compose.material3.WavyProgressIndicatorDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.FunctionalComposableScope
import expo.modules.ui.ModifierList
import expo.modules.ui.ModifierRegistry
import expo.modules.ui.composeOrNull

data class LinearWavyProgressIndicatorProps(
  val progress: Float? = null,
  val color: Color? = null,
  val trackColor: Color? = null,
  val modifiers: ModifierList = emptyList()
) : ComposeProps

/**
 * @expo/ui's `LinearWavyProgressIndicator`, which jumps to each new progress,
 * sliding there on M3's own progress spec instead.
 */
@OptIn(ExperimentalMaterial3ExpressiveApi::class)
@Composable
fun FunctionalComposableScope.LinearWavyProgressIndicatorContent(props: LinearWavyProgressIndicatorProps) {
  val modifier = ModifierRegistry.applyModifiers(props.modifiers, appContext, composableScope, globalEventDispatcher)
  val color = props.color.composeOrNull ?: WavyProgressIndicatorDefaults.indicatorColor
  val trackColor = props.trackColor.composeOrNull ?: WavyProgressIndicatorDefaults.trackColor
  val target = props.progress

  if (target == null) {
    LinearWavyProgressIndicator(color = color, trackColor = trackColor, modifier = modifier)
    return
  }

  val progress by animateFloatAsState(target, WavyProgressIndicatorDefaults.ProgressAnimationSpec)
  LinearWavyProgressIndicator(
    progress = { progress },
    color = color,
    trackColor = trackColor,
    modifier = modifier
  )
}
