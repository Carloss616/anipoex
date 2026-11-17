import { Icons } from "@/components/ui/icon";
import type { MenuItem, MenuItemDialogConfig } from "@/components/ui/menu";
import type { CustomList } from "@/features/manga/utils/to-counts";

export const CUSTOM_LISTS_HELP = {
  label: "About custom lists",
  text: "Custom lists group manga already on your list. Deleting one keeps its manga under their status.",
};

export const deleteListDialog = ({
  name,
  count,
}: CustomList): MenuItemDialogConfig => ({
  title: `Delete “${name}”?`,
  description: `${count ? `Its ${count} manga stay on your list under their status. ` : ""}This also deletes it on AniList.`,
  confirmLabel: "Delete",
});

/**
 * The row's menu, off while a delete runs; `confirm: false` where the row
 * already confirms Delete (iOS).
 */
export function listMenuItems(
  list: CustomList,
  { onRename, onDelete }: { onRename: () => void; onDelete: () => void },
  busy: boolean,
  confirm = true,
): MenuItem[] {
  const remove = {
    label: "Delete",
    icon: Icons.trash,
    destructive: true,
    disabled: busy,
    onPress: onDelete,
  };
  return [
    { label: "Rename", icon: Icons.edit, disabled: busy, onPress: onRename },
    confirm
      ? {
          ...remove,
          onPressMode: "dialog",
          dialogConfig: deleteListDialog(list),
        }
      : remove,
  ];
}
