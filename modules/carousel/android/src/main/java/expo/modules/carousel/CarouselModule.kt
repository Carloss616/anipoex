package expo.modules.carousel

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.ui.ExpoUIView

class CarouselModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("Carousel")

    ExpoUIView<HorizontalMultiBrowseCarouselProps>("HorizontalMultiBrowseCarouselView") {
      Content { props -> HorizontalMultiBrowseCarouselContent(props) }
    }
  }
}
