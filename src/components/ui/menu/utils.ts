import { noop } from "@/utils/utils";
import type { MenuAction, MenuGroup, MenuItem, MenuSubmenu } from "./menu";

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
