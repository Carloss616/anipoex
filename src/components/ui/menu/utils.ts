import type { MenuAction, MenuItem, MenuSubmenu } from "./menu";

export const isSubmenu = (item: MenuItem): item is MenuSubmenu =>
  "items" in item;

/** For a menu without submenus (Compose's dropdown): their rows join the list, named after it. */
export const flattenSubmenus = (items: MenuItem[]): MenuAction[] =>
  items.flatMap((item) =>
    isSubmenu(item)
      ? item.items.map((row) => ({
          ...row,
          label: `${item.label}: ${row.label}`,
          disabled: item.disabled || row.disabled,
        }))
      : [item],
  );
