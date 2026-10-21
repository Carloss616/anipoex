import type { MenuItem, MenuItemDialogConfig } from "@/components/ui/menu";
import { type Extension, uninstallExtension } from "@/features/extensions";

/** What uninstalling asks before it runs. */
export const uninstallDialog = (e: Extension): MenuItemDialogConfig => ({
  title: `Uninstall ${e.name}?`,
  description: "You can install it again from Available.",
  confirmLabel: "Uninstall",
});

/** The row menu's one action, confirmed in a dialog before it runs. */
export function uninstallItem(e: Extension): MenuItem {
  return {
    label: "Uninstall",
    destructive: true,
    onPress: () => uninstallExtension(e.id),
    onPressMode: "dialog",
    dialogConfig: uninstallDialog(e),
  };
}
