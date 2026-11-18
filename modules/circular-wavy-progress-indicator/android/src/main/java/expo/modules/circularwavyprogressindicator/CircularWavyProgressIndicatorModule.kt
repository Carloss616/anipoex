package expo.modules.circularwavyprogressindicator

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.ui.ExpoUIView

class CircularWavyProgressIndicatorModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("CircularWavyProgressIndicator")

    ExpoUIView<CircularWavyProgressIndicatorProps>("CircularWavyProgressIndicatorView") {
      Content { props -> CircularWavyProgressIndicatorContent(props) }
    }
  }
}
