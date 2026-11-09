import { type IconName, Icons } from "@/components/ui/icon";
import type { ThemePreference } from "@/state/theme/constants";

export const THEME_OPTIONS: {
  id: ThemePreference;
  label: string;
  icon: IconName;
}[] = [
  { id: "system", label: "System", icon: Icons.themeSystem },
  { id: "light", label: "Light", icon: Icons.themeLight },
  { id: "dark", label: "Dark", icon: Icons.themeDark },
];
