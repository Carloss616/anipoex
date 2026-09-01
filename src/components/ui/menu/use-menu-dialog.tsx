import { useState } from "react";
import type { MenuItem } from "./menu";

/**
 * Arms the `onPressMode: "dialog"` rows.
 *
 * A native menu row is a SwiftUI `Button` or a Compose `DropdownMenuItem`, so
 * it can never be a `Dialog.Trigger` — the row instead records itself as
 * pending, and only one row can be pending at a time.
 */
export function useMenuDialogState(items: MenuItem[]) {
  const [pending, setPending] = useState<MenuItem | null>(null);

  const rows = items.map((item) =>
    item.onPressMode === "dialog"
      ? { ...item, onPress: () => setPending(item) }
      : item,
  );

  return { rows, pending, close: () => setPending(null) };
}
