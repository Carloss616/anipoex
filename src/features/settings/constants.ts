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
  activity: "Scans, downloads and changes waiting to be sent",
  autoPick: "After a scan, the one with the most new chapters",
  slowSkip: "A source slower than this is left out of a Reading scan",
  dns: "The resolver extensions use",
  listRefreshOnOpen: "Fetch your whole list when you open the app",
  listRefreshAfter: "Only when the last refresh is older than this",
};

/** How old the list must be before opening the app fetches it, in minutes. */
export const LIST_REFRESH_OPTIONS = [
  { minutes: 5, label: "5 min" },
  { minutes: 15, label: "15 min" },
  { minutes: 30, label: "30 min" },
  { minutes: 60, label: "1 hour" },
];

/** The option's label; a value another build stored shows as minutes. */
export const listRefreshLabel = (minutes: number) =>
  LIST_REFRESH_OPTIONS.find((option) => option.minutes === minutes)?.label ??
  `${minutes} min`;

export type SaveTo = NonNullable<Settings["device"]["downloadsIn"]>;

export const SAVE_TO_OPTIONS: { id: SaveTo; label: string }[] = [
  { id: "sync", label: "Sync Folder" },
  { id: "folder", label: "New Folder" },
  { id: "device", label: "This device" },
];
