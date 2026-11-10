import { type IconName, Icons } from "@/components/ui/icon";
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
