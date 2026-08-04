import { useThemeColor } from "heroui-native/hooks";
import { Uniwind, useUniwind } from "uniwind";
import { CloseButton } from "@/components/ui/close-button";
import { Icon } from "@/components/ui/icon";

export function ThemeToggle() {
  const { theme } = useUniwind();
  const iconColor = useThemeColor("default-foreground");
  const isLight = theme === "light";

  return (
    <CloseButton
      className="h-10"
      onPress={() => Uniwind.setTheme(isLight ? "dark" : "light")}
    >
      <Icon
        name={Icon.select({
          ios: isLight ? "sun.max" : "moon",
          android: isLight
            ? require("@expo/material-symbols/light_mode.xml")
            : require("@expo/material-symbols/dark_mode.xml"),
          web: isLight ? "sun" : "moon",
        })}
        size={18}
        color={iconColor}
      />
    </CloseButton>
  );
}
