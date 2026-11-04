import type { HTMLAttributes } from "react";
import { noop } from "@/utils/utils";
import type {
  MenuAction,
  MenuGroup,
  MenuItem,
  MenuProps,
  MenuSubmenu,
} from "./menu";

export const isSubmenu = (item: MenuItem): item is MenuSubmenu =>
  "items" in item && "label" in item;

export const isGroup = (item: MenuItem): item is MenuGroup =>
  "items" in item && !("label" in item);

/**
 * For a menu without submenus or groups (Compose's dropdown): a submenu's rows
 * join the list, named after it, and a group's follow its heading as a
 * disabled row.
 */
export const flattenRows = (items: MenuItem[]): MenuAction[] =>
  items.flatMap((item) => {
    if (isGroup(item)) {
      return item.heading
        ? [
            { label: item.heading, disabled: true, onPress: noop },
            ...item.items,
          ]
        : item.items;
    }
    return isSubmenu(item)
      ? item.items.map((row) => ({
          ...row,
          label: `${item.label}: ${row.label}`,
          disabled: item.disabled || row.disabled,
        }))
      : [item];
  });

type Handler = ((event: never) => void) | undefined;

/** A react-native pressable trigger is passed with an `onPress` prop. */
export const isPressable = (child: MenuProps["children"]) =>
  "onPress" in child.props;

/**
 * Click and right-click as a pressable's press and long press, after its own.
 * @platform web
 */
export function asPress(
  props: HTMLAttributes<Element>,
  child: MenuProps["children"],
) {
  const both = (own: Handler, menu: Handler) => (event: never) => {
    own?.(event);
    menu?.(event);
  };
  return {
    ...props,
    onPress: both(child.props.onPress, props.onClick),
    onLongPress: both(child.props.onLongPress, props.onContextMenu),
  };
}
