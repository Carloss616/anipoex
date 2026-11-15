package expo.modules.horizontalmultibrowsecarousel

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.ui.ExpoUIView

class HorizontalMultiBrowseCarouselModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("HorizontalMultiBrowseCarousel")

    ExpoUIView<HorizontalMultiBrowseCarouselProps>("HorizontalMultiBrowseCarouselView") {
      Content { props -> HorizontalMultiBrowseCarouselContent(props) }
    }
  }
}
