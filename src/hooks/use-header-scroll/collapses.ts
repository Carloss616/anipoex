import type { NativeScrollEvent } from "react-native";

/**
 * Whether the header belongs in its scrolled state. Collapsing hands the large
 * title's row (`givesBack`) back to the scroller, so on a barely-scrollable screen
 * the offset clamps to 0, the title reopens, and it oscillates — hence UIKit's own
 * rule: the content has to still overflow *once collapsed*, not just right now.
 */
export function collapses(
  { contentOffset, contentSize, layoutMeasurement }: NativeScrollEvent,
  { collapsed, givesBack }: { collapsed: boolean; givesBack: number },
) {
  // A collapsed scroller already measures that row: both branches, one viewport.
  const height = layoutMeasurement.height + (collapsed ? 0 : givesBack);

  return contentSize.height > height && contentOffset.y > 0;
}
