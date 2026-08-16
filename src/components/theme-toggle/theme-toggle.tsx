import { Uniwind, useUniwind } from "uniwind";
import { CloseButton } from "@/components/ui/close-button";
import { Icon } from "@/components/ui/icon";
import { useThemeColor } from "@/hooks/use-theme-color";

/** Tap flips `light`/`dark`; long press hands the theme back to the system. */
export function ThemeToggle() {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const foreground = useThemeColor("foreground");
  const isLight = theme === "light";

  const icon = hasAdaptiveThemes
    ? Icon.select({
        ios: "circle.lefthalf.filled",
        android: require("@expo/material-symbols/brightness_auto.xml"),
        web: "sun-moon",
      })
    : Icon.select({
        ios: isLight ? "sun.max" : "moon",
        android: isLight
          ? require("@expo/material-symbols/light_mode.xml")
          : require("@expo/material-symbols/dark_mode.xml"),
        web: isLight ? "sun" : "moon",
      });

  return (
    <CloseButton
      variant="ghost"
      onPress={() => Uniwind.setTheme(isLight ? "dark" : "light")}
      onLongPress={() => Uniwind.setTheme("system")}
    >
      <Icon name={icon} size={18} color={foreground} />
    </CloseButton>
  );
}
