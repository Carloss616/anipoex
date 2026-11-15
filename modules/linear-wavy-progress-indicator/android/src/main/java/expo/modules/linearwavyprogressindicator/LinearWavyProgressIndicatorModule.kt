package expo.modules.linearwavyprogressindicator

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.ui.ExpoUIView

class LinearWavyProgressIndicatorModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("LinearWavyProgressIndicator")

    ExpoUIView<LinearWavyProgressIndicatorProps>("LinearWavyProgressIndicatorView") {
      Content { props -> LinearWavyProgressIndicatorContent(props) }
    }
  }
}
