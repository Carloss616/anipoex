package expo.modules.circularwavyprogressindicator

import android.graphics.Color
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.material3.CircularWavyProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3ExpressiveApi
import androidx.compose.material3.WavyProgressIndicatorDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.FunctionalComposableScope
import expo.modules.ui.ModifierList
import expo.modules.ui.ModifierRegistry
import expo.modules.ui.composeOrNull

data class CircularWavyProgressIndicatorProps(
  val progress: Float = 0f,
  val color: Color? = null,
  val trackColor: Color? = null,
  /** In dp, for the indicator and its track; M3's 4dp when unset. */
  val strokeWidth: Float? = null,
  /** In dp per second; `0` holds the wave still. */
  val waveSpeed: Float? = null,
  val modifiers: ModifierList = emptyList()
) : ComposeProps

/**
 * M3's `CircularWavyProgressIndicator` with the stroke width @expo/ui's leaves
 * out, sliding to each new progress on M3's own spec as the linear one does.
 */
@OptIn(ExperimentalMaterial3ExpressiveApi::class)
@Composable
fun FunctionalComposableScope.CircularWavyProgressIndicatorContent(props: CircularWavyProgressIndicatorProps) {
  val modifier = ModifierRegistry.applyModifiers(props.modifiers, appContext, composableScope, globalEventDispatcher)
  val progress by animateFloatAsState(props.progress, WavyProgressIndicatorDefaults.ProgressAnimationSpec)
  val stroke = props.strokeWidth?.let {
    Stroke(width = with(LocalDensity.current) { it.dp.toPx() }, cap = StrokeCap.Round)
  }
  val wavelength = WavyProgressIndicatorDefaults.CircularWavelength

  CircularWavyProgressIndicator(
    progress = { progress },
    modifier = modifier,
    color = props.color.composeOrNull ?: WavyProgressIndicatorDefaults.indicatorColor,
    trackColor = props.trackColor.composeOrNull ?: WavyProgressIndicatorDefaults.trackColor,
    stroke = stroke ?: WavyProgressIndicatorDefaults.circularIndicatorStroke,
    trackStroke = stroke ?: WavyProgressIndicatorDefaults.circularTrackStroke,
    wavelength = wavelength,
    waveSpeed = props.waveSpeed?.dp ?: wavelength
  )
}
