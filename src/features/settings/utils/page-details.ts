import { type IconName, Icons } from "@/components/ui/icon";
import { languageName, languageOrder$ } from "@/features/extensions";
import { PRESET_LABELS } from "@/features/home/constants";
import { SAVE_TO_OPTIONS } from "@/features/settings/screens/settings/components/downloads-section/constants";
import { folderLabel } from "@/features/settings/screens/settings/components/downloads-section/utils";
import { github$ } from "@/features/sync/state/github";
import { session$ } from "@/state/session";
import { settings$ } from "@/state/settings";
import { THEME_FAMILIES } from "@/state/theme/constants";
import { THEME_OPTIONS } from "../constants";
import { greeting } from "./greeting";
import type { SettingsPageId } from "./settings-pages";

export const PAGE_ICONS: Record<SettingsPageId, IconName> = {
  account: Icons.person,
  activity: Icons.history,
  appearance: Icons.palette,
  home: Icons.home,
  sync: Icons.cloud,
  sources: Icons.language,
  downloads: Icons.download,
};

/**
 * Each page's current value for its index row. They read with `get()`, so a
 * `Memo` around one re-renders on that value only. Activity's row is its own.
 */
export const PAGE_SUMMARIES: Partial<Record<SettingsPageId, () => string>> = {
  account: () => greeting(session$.user.get()?.name),
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
  sources: () => languageOrder$.get().map(languageName).join(", "),
  downloads: () => {
    const option = settings$.device.downloadsIn.get() ?? "sync";
    return option === "folder"
      ? folderLabel(settings$.device.downloadsFolder.get())
      : (SAVE_TO_OPTIONS.find((o) => o.id === option)?.label ?? "");
  },
};
