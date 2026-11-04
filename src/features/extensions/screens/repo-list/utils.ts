import * as Clipboard from "expo-clipboard";
import { Platform } from "react-native";
import { Icons } from "@/components/ui/icon";
import type { MenuItem, MenuItemDialogConfig } from "@/components/ui/menu";
import { toast } from "@/components/ui/toast";
import type { Repo } from "@/features/extensions";
import { openExternal } from "@/utils/open-external";

// Android 13+ shows its own "Copied" notice for every copy.
const SYSTEM_CONFIRMS_COPY =
  Platform.OS === "android" && Number(Platform.Version) >= 33;

export const copyRepoUrl = (repo: Repo) =>
  void Clipboard.setStringAsync(repo.indexUrl).then(
    () => {
      if (!SYSTEM_CONFIRMS_COPY) toast.success("URL copied");
    },
    () => toast.error("Couldn't copy the URL"),
  );

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
