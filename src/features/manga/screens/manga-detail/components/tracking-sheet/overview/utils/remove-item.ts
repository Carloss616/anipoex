import type { MenuItem } from "@/components/ui/menu";

/** The overview menu's one row, confirmed in a dialog before it runs. */
export function removeItem(onRemove: () => void, disabled: boolean): MenuItem {
  return {
    label: "Remove from list",
    onPress: onRemove,
    onPressMode: "dialog",
    dialogConfig: {
      title: "Remove from list?",
      description: "This action cannot be undone.",
      confirmLabel: "Remove",
    },
    destructive: true,
    disabled,
  };
}
