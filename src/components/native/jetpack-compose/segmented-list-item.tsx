import type { ViewEvent } from "@expo/ui/jetpack-compose";
import type { ModifierConfig } from "@expo/ui/jetpack-compose/modifiers";
import { requireNativeView } from "expo";
import type { ReactNode } from "react";

type ItemEvent = { index: number };

interface SegmentedListItemProps {
  /** Its place in the list, for its corners. */
  index: number;
  count: number;
  /** Leave out for an action row; set, the row is one choice of a single-select list, with its radio. */
  selected?: boolean;
  enabled?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  modifiers?: ModifierConfig[];
  /** The headline, then `SegmentedListItem.Leading`, `.Trailing`, `.Overline`, `.Supporting`. */
  children: ReactNode;
}

const NativeItem = requireNativeView<
  Omit<SegmentedListItemProps, "onPress" | "onLongPress"> & {
    longPressable: boolean;
  } & ViewEvent<"onItemPress", ItemEvent> &
    ViewEvent<"onItemLongPress", ItemEvent>
>("SegmentedListItem", "SegmentedListItemView");
// @expo/ui's own slot marker, which it doesn't export.
const SlotView = requireNativeView<{ slotName: string; children: ReactNode }>(
  "ExpoUI",
  "SlotView",
);

/** M3 Expressive segmented list item (`modules/segmented-list-item`), in a Column or LazyColumn. */
export function SegmentedListItem({
  onPress,
  onLongPress,
  ...props
}: SegmentedListItemProps) {
  return (
    <NativeItem
      {...props}
      longPressable={!!onLongPress}
      onItemPress={onPress}
      onItemLongPress={onLongPress}
    />
  );
}

/** `ListItemDefaults.SegmentedGap`: the space between segmented rows. */
export const SEGMENTED_GAP = 2;

/** `ListItemDefaults.segmentedShapes`: the group's ends, the rest in between. */
export const SEGMENTED_CORNER = { outer: 16, inner: 4 };

const slot = (name: string) =>
  function Slot({ children }: { children: ReactNode }) {
    return <SlotView slotName={name}>{children}</SlotView>;
  };

SegmentedListItem.Leading = slot("leading");
SegmentedListItem.Trailing = slot("trailing");
SegmentedListItem.Overline = slot("overline");
SegmentedListItem.Supporting = slot("supporting");
