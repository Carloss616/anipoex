import { useState } from "react";
import type { MenuAction, MenuItem } from "../menu";
import { isSubmenu } from "../utils";

/**
 * Arms the `onPressMode: "dialog"` rows, a submenu's included.
 *
 * A native menu row is a SwiftUI `Button` or a Compose `DropdownMenuItem`, so
 * it can never be a `Dialog.Trigger` — the row instead records itself as
 * pending, and only one row can be pending at a time.
 */
export function useMenuDialogState(items: MenuItem[]) {
  const [pending, setPending] = useState<MenuAction | null>(null);

  const arm = (item: MenuAction): MenuAction =>
    item.onPressMode === "dialog"
      ? { ...item, onPress: () => setPending(item) }
      : item;
  const rows = items.map((item) =>
    isSubmenu(item) ? { ...item, items: item.items.map(arm) } : arm(item),
  );

  return { rows, pending, close: () => setPending(null) };
}
