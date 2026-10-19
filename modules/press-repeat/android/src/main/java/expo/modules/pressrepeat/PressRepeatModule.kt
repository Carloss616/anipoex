package expo.modules.pressrepeat

import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.waitForUpOrCancellation
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.PointerEventPass
import androidx.compose.ui.input.pointer.pointerInput
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.ui.ModifierRegistry
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private const val TYPE = "onPressRepeat"

class PressRepeatModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("PressRepeat")

    OnCreate {
      // Sends `start` when a press begins, then `repeat` every 80ms once it has been held 400ms, and nothing after release.
      ModifierRegistry.register(TYPE) { _, _, _, eventDispatcher ->
        val dispatch by rememberUpdatedState(eventDispatcher)
        Modifier.pointerInput(Unit) {
          coroutineScope {
            awaitEachGesture {
              // Initial pass: watch the press before the button's own clickable consumes it.
              awaitFirstDown(requireUnconsumed = false, pass = PointerEventPass.Initial)
              dispatch(TYPE, mapOf("type" to "start"))
              val repeat = launch {
                delay(400)
                while (true) {
                  dispatch(TYPE, mapOf("type" to "repeat"))
                  delay(80)
                }
              }
              waitForUpOrCancellation(PointerEventPass.Initial)
              repeat.cancel()
            }
          }
        }
      }
    }
  }
}
