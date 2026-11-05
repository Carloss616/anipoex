package expo.modules.topappbar

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.ui.ExpoUIView

class TopAppBarModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("TopAppBar")

    ExpoUIView<TopAppBarProps>("TopAppBarView") {
      val onSearchTextChange by Event<SearchTextEvent>()
      val onSearchSubmit by Event<SearchTextEvent>()
      val onPageChange by Event<PageChangeEvent>()
      Content { props ->
        TopAppBarContent(props, { onSearchTextChange(it) }, { onSearchSubmit(it) }, { onPageChange(it) })
      }
    }
  }
}
