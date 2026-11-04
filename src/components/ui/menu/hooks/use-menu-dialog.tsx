import { useState } from "react";
import type { MenuAction, MenuItem } from "../menu";

/**
 * Arms the `onPressMode: "dialog"` rows, a submenu's and a group's included.
 * A native row (SwiftUI `Button`, Compose `DropdownMenuItem`) can't be a
 * `Dialog.Trigger`, so it records itself as pending, one row at a time.
 */
export function useMenuDialogState(items: MenuItem[]) {
  const [pending, setPending] = useState<MenuAction | null>(null);

  const arm = (item: MenuAction): MenuAction =>
    item.onPressMode === "dialog"
      ? { ...item, onPress: () => setPending(item) }
      : item;
  const rows = items.map((item) =>
    "items" in item ? { ...item, items: item.items.map(arm) } : arm(item),
  );

  return { rows, pending, close: () => setPending(null) };
}
