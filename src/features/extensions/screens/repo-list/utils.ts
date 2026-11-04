import { Icons } from "@/components/ui/icon";
import type { MenuItem, MenuItemDialogConfig } from "@/components/ui/menu";
import type { Repo } from "@/features/extensions";
import { copyUrl } from "@/utils/copy-url";
import { openExternal } from "@/utils/open-external";

export const copyRepoUrl = (repo: Repo) => copyUrl(repo.indexUrl);

export const removeRepoDialog = (repo: Repo): MenuItemDialogConfig => ({
  title: `Remove ${repo.name}?`,
  description: "Its extensions leave the list. Installed ones stay installed.",
  confirmLabel: "Remove",
});

/** The row's actions for the house `Menu`; iOS builds its context menu itself. */
export function repoMenuItems(repo: Repo, onRemove: () => void): MenuItem[] {
  const { website } = repo;
  return [
    ...(website
      ? [
          {
            label: "Open website",
            icon: Icons.website,
            onPress: () => openExternal(website),
          },
        ]
      : []),
    { label: "Copy URL", icon: Icons.copy, onPress: () => copyRepoUrl(repo) },
    {
      label: "Remove",
      icon: Icons.trash,
      destructive: true,
      onPress: onRemove,
      onPressMode: "dialog",
      dialogConfig: removeRepoDialog(repo),
    },
  ];
}
