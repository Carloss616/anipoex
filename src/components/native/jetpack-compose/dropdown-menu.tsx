import type { ViewEvent } from "@expo/ui/jetpack-compose";
import { requireNativeView } from "expo";
import type { ReactNode } from "react";
import { useFontFamily } from "@/hooks/use-font";

type MenuEvent = { index: number };

const NativeMenu = requireNativeView<
  { expanded: boolean; children: ReactNode } & ViewEvent<
    "onDismissRequest",
    MenuEvent
  >
>("DropdownMenu", "DropdownMenuView");
const NativeGroup = requireNativeView<{
  index: number;
  count: number;
  heading?: string;
  fontFamily?: string;
  children: ReactNode;
}>("DropdownMenu", "DropdownMenuGroupView");
const NativeItem = requireNativeView<
  Omit<DropdownMenuItemProps, "onPress"> & { fontFamily?: string } & ViewEvent<
      "onItemPress",
      MenuEvent
    >
>("DropdownMenu", "DropdownMenuItemView");
// @expo/ui's own slot marker, which it doesn't export.
const SlotView = requireNativeView<{ slotName: string; children: ReactNode }>(
  "ExpoUI",
  "SlotView",
);

/**
 * M3 Expressive dropdown menu from the local `modules/dropdown-menu`: groups of rounded rows in a
 * popup anchored to the trigger. Must sit inside a Host. The house `Menu`
 * (`@/components/ui/menu`) builds it; use that.
 */
export function DropdownMenu({
  expanded,
  onDismiss,
  children,
}: {
  expanded: boolean;
  onDismiss: () => void;
  /** `DropdownMenu.Trigger`, then the groups. */
  children: ReactNode;
}) {
  return (
    <NativeMenu expanded={expanded} onDismissRequest={onDismiss}>
      {children}
    </NativeMenu>
  );
}

DropdownMenu.Trigger = function Trigger({ children }: { children: ReactNode }) {
  return <SlotView slotName="trigger">{children}</SlotView>;
};

DropdownMenu.Group = function Group(props: {
  /** Its place among the groups, for its corners. */
  index: number;
  count: number;
  heading?: string;
  children: ReactNode;
}) {
  return <NativeGroup {...props} fontFamily={useFontFamily("medium")} />;
};

interface DropdownMenuItemProps {
  label: string;
  /** Its place in the group, for its corners. */
  index: number;
  count: number;
  /** Leave out for a plain action; set, the row shows whether it's on. */
  checked?: boolean;
  selection?: "radio" | "checkbox";
  enabled?: boolean;
  destructive?: boolean;
  onPress: () => void;
  /** The leading icon. */
  children?: ReactNode;
}

DropdownMenu.Item = function Item({
  onPress,
  ...props
}: DropdownMenuItemProps) {
  return (
    <NativeItem
      {...props}
      fontFamily={useFontFamily("medium")}
      onItemPress={onPress}
    />
  );
};
