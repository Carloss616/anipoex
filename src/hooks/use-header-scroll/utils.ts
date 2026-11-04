import type { NativeScrollEvent } from "react-native";

/**
 * Whether the header belongs in its scrolled state. Collapsing gives the large
 * title's row (`givesBack`) back to the scroller, so on a barely-scrollable
 * screen the offset clamps to 0, the title reopens, and it oscillates. Hence
 * UIKit's rule: the content must still overflow *once collapsed*.
 */
export function collapses(
  { contentOffset, contentSize, layoutMeasurement }: NativeScrollEvent,
  { collapsed, givesBack }: { collapsed: boolean; givesBack: number },
) {
  // A collapsed scroller already counts that row: both cases, one viewport.
  const height = layoutMeasurement.height + (collapsed ? 0 : givesBack);

  return contentSize.height > height && contentOffset.y > 0;
}
