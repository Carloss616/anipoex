package expo.modules.buttongroup

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.ui.ExpoUIView

class ButtonGroupModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ButtonGroup")

    ExpoUIView<ButtonGroupProps>("ButtonGroupView") {
      // Not onChange: React Native already has a bubbling topChange.
      val onToggle by Event<ButtonGroupChangeEvent>()
      Content { props -> ButtonGroupContent(props) { onToggle(it) } }
    }
  }
}
