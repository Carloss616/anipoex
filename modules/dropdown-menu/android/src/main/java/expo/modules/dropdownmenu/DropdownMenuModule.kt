package expo.modules.dropdownmenu

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.ui.ExpoUIView

class DropdownMenuModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("DropdownMenu")

    ExpoUIView<DropdownMenuProps>("DropdownMenuView") {
      val onDismissRequest by Event<DropdownMenuEvent>()
      Content { props -> DropdownMenuContent(props) { onDismissRequest(it) } }
    }

    ExpoUIView<DropdownMenuGroupProps>("DropdownMenuGroupView") {
      Content { props -> DropdownMenuGroupContent(props) }
    }

    ExpoUIView<DropdownMenuItemProps>("DropdownMenuItemView") {
      // Not onClick or onSelect: React Native already registers those as bubbling.
      val onItemPress by Event<DropdownMenuEvent>()
      Content { props -> DropdownMenuItemContent(props) { onItemPress(it) } }
    }
  }
}
