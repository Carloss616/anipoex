import type { ViewEvent } from "@expo/ui/jetpack-compose";
import type { ModifierConfig } from "@expo/ui/jetpack-compose/modifiers";
import { requireNativeView } from "expo";
import { Children, isValidElement, type ReactNode } from "react";
import type { ColorValue } from "react-native";

type ItemEvent = { index: number };

interface SegmentedListItemProps {
  /** Its place in the list, for its corners. */
  index: number;
  count: number;
  /** Leave out for an action row; set, the row is one choice of a single-select list, with its radio. */
  selected?: boolean;
  enabled?: boolean;
  /** Its fill when not selected; M3's segmented color (surface) when left out. */
  containerColor?: ColorValue;
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

/** M3 Expressive segmented list item (`modules/segmented-list-item`); a slot that comes or goes remounts it. */
export function SegmentedListItem({
  onPress,
  onLongPress,
  modifiers = [],
  ...props
}: SegmentedListItemProps) {
  return (
    <NativeItem
      // Slots are found as the module composes: a new one shows only on a remount.
      key={slotNames(props.children)}
      {...props}
      // Never undefined: a recycled row that drops its list sends null, which
      // the native list prop can't read.
      modifiers={modifiers}
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
  Object.assign(
    function Slot({ children }: { children: ReactNode }) {
      return <SlotView slotName={name}>{children}</SlotView>;
    },
    { slotName: name },
  );

const slotNames = (children: ReactNode) =>
  Children.toArray(children)
    .flatMap((child) =>
      isValidElement(child) &&
      typeof child.type === "function" &&
      "slotName" in child.type
        ? [child.type.slotName]
        : [],
    )
    .join();

SegmentedListItem.Leading = slot("leading");
SegmentedListItem.Trailing = slot("trailing");
SegmentedListItem.Overline = slot("overline");
SegmentedListItem.Supporting = slot("supporting");
