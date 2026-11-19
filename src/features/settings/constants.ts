import { type IconName, Icons } from "@/components/ui/icon";
import type { Settings } from "@/state/settings/utils/migrate";
import type { ThemePreference } from "@/state/theme/constants";

/** How long a Reading scan waits on a source before skipping it, in seconds. */
export const SLOW_SKIP_OPTIONS = [
  { seconds: 0, label: "Off" },
  { seconds: 30, label: "30 s" },
  { seconds: 60, label: "1 min" },
  { seconds: 120, label: "2 min" },
];

export const THEME_OPTIONS: {
  id: ThemePreference;
  label: string;
  icon: IconName;
}[] = [
  { id: "system", label: "System", icon: Icons.themeSystem },
  { id: "light", label: "Light", icon: Icons.themeLight },
  { id: "dark", label: "Dark", icon: Icons.themeDark },
];

/** Each setting's supporting line, the same on every platform. */
export const DESCRIPTIONS = {
  pending: "Changes waiting to be sent",
  activity: "Scans running now and the Reading scan's queue",
  autoPick: "After a scan, the one with the most new chapters",
  slowSkip: "A source slower than this is left out of a Reading scan",
  dns: "The resolver extensions use",
};

export type SaveTo = NonNullable<Settings["device"]["downloadsIn"]>;

export const SAVE_TO_OPTIONS: { id: SaveTo; label: string }[] = [
  { id: "sync", label: "Sync Folder" },
  { id: "folder", label: "New Folder" },
  { id: "device", label: "This device" },
];
