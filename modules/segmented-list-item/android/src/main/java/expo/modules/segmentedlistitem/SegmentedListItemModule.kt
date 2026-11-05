package expo.modules.segmentedlistitem

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.ui.ExpoUIView

class SegmentedListItemModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SegmentedListItem")

    ExpoUIView<SegmentedListItemProps>("SegmentedListItemView") {
      // Not onClick or onLongPress: React Native already registers those as bubbling.
      val onItemPress by Event<SegmentedListItemEvent>()
      val onItemLongPress by Event<SegmentedListItemEvent>()
      Content { props -> SegmentedListItemContent(props, { onItemPress(it) }, { onItemLongPress(it) }) }
    }
  }
}
