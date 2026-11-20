import { type IconName, Icons } from "@/components/ui/icon";
import { PRESET_LABELS } from "@/features/home/constants";
import { github$ } from "@/features/sync/state/github";
import { APP_VERSION, updates$ } from "@/features/updates/state/updates";
import { settings$ } from "@/state/settings";
import { THEME_FAMILIES } from "@/state/theme/constants";
import { SAVE_TO_OPTIONS, THEME_OPTIONS } from "../constants";
import { folderLabel } from "./folder-label";
import { languagesLabel } from "./languages-label";
import type { SettingsPageId } from "./settings-pages";

export const PAGE_ICONS: Record<SettingsPageId, IconName> = {
  account: Icons.person,
  activity: Icons.update,
  appearance: Icons.palette,
  home: Icons.home,
  sync: Icons.cloud,
  sources: Icons.language,
  downloads: Icons.download,
  about: Icons.info,
};

/**
 * Each page's current value for its index row. They read with `get()`, so a
 * `Memo` around one re-renders on that value only. Account and Activity draw
 * their own rows.
 */
export const PAGE_SUMMARIES: Partial<Record<SettingsPageId, () => string>> = {
  appearance: () => {
    const { preference, family } = settings$.theme.get();
    const mode = THEME_OPTIONS.find((option) => option.id === preference);
    const name = THEME_FAMILIES.find((f) => f.id === family)?.name;
    return [mode?.label, name].filter(Boolean).join(" · ");
  },
  home: () => PRESET_LABELS[settings$.home.preset.get()],
  sync: () =>
    [
      github$.account.get() && "GitHub",
      settings$.device.folder.get() && "Folder",
    ]
      .filter(Boolean)
      .join(" · ") || "Off",
  about: () =>
    updates$.available.get() ? "Update available" : `Version ${APP_VERSION}`,
  sources: languagesLabel,
  downloads: () => {
    const option = settings$.device.downloadsIn.get() ?? "sync";
    return option === "folder"
      ? folderLabel(settings$.device.downloadsFolder.get())
      : (SAVE_TO_OPTIONS.find((o) => o.id === option)?.label ?? "");
  },
};
