import type { SettingsPageId } from "@/features/settings/utils/settings-pages";

/** iOS Settings' colored icon tiles, one hue per page. */
export const ICON_TINTS: Record<SettingsPageId, string> = {
  account: "#8E8E93",
  activity: "#007AFF",
  appearance: "#AF52DE",
  home: "#34C759",
  sync: "#5856D6",
  sources: "#FF2D55",
  downloads: "#FF9500",
};
