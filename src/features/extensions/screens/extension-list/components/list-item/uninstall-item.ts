import type { MenuItem } from "@/components/ui/menu";
import { type Extension, uninstallExtension } from "@/features/extensions";

/** The row menu's one action, confirmed in a dialog before it runs. */
export function uninstallItem(e: Extension): MenuItem {
  return {
    label: "Uninstall",
    destructive: true,
    onPress: () => uninstallExtension(e.id),
    onPressMode: "dialog",
    dialogConfig: {
      title: `Uninstall ${e.name}?`,
      description: "You can install it again from Available.",
      confirmLabel: "Uninstall",
    },
  };
}
