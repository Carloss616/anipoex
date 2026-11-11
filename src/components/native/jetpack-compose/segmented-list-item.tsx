import type { ListItemColors, ViewEvent } from "@expo/ui/jetpack-compose";
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
  /** `ListItemDefaults.segmentedColors`; one left out keeps M3's (surface fill). */
  colors?: ListItemColors & {
    selectedContainerColor?: ColorValue;
    selectedContentColor?: ColorValue;
  };
  /** Left out, M3 centers short rows and tops tall ones (three lines and up). */
  verticalAlignment?: "top" | "center" | "bottom";
  /** In dp; a side left out keeps M3's. */
  contentPadding?: {
    start?: number;
    top?: number;
    end?: number;
    bottom?: number;
  };
  /** Corner radii in dp over the segmented ones: `0` on a shared edge joins two rows. */
  shape?: {
    topStart?: number;
    topEnd?: number;
    bottomEnd?: number;
    bottomStart?: number;
  };
  onPress?: () => void;
  onLongPress?: () => void;
  /** TalkBack's name for the long-press action ("Open menu"). */
  onLongPressLabel?: string;
  modifiers?: ModifierConfig[];
  /** The headline, then `SegmentedListItem.Leading`, `.Trailing`, `.Overline`, `.Supporting`. */
  children: ReactNode;
}

const NativeItem = requireNativeView<
  Omit<SegmentedListItemProps, "onPress" | "onLongPress"> & {
    pressable: boolean;
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
      pressable={!!onPress}
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

type SlotProps = { children: ReactNode };

function Leading({ children }: SlotProps) {
  return <SlotView slotName={Leading.slotName}>{children}</SlotView>;
}
Leading.slotName = "leading";

function Trailing({ children }: SlotProps) {
  return <SlotView slotName={Trailing.slotName}>{children}</SlotView>;
}
Trailing.slotName = "trailing";

function Overline({ children }: SlotProps) {
  return <SlotView slotName={Overline.slotName}>{children}</SlotView>;
}
Overline.slotName = "overline";

function Supporting({ children }: SlotProps) {
  return <SlotView slotName={Supporting.slotName}>{children}</SlotView>;
}
Supporting.slotName = "supporting";

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

SegmentedListItem.Leading = Leading;
SegmentedListItem.Trailing = Trailing;
SegmentedListItem.Overline = Overline;
SegmentedListItem.Supporting = Supporting;
