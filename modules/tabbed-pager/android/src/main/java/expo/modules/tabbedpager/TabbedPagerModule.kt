package expo.modules.tabbedpager

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.ui.ExpoUIView

class TabbedPagerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("TabbedPager")

    ExpoUIView<TabbedPagerProps>("TabbedPagerView") {
      val onPageChange by Event<PageChangeEvent>()
      Content { props -> TabbedPagerContent(props) { onPageChange(it) } }
    }
  }
}
