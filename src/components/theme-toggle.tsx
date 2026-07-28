import { Lucide } from "@react-native-vector-icons/lucide";
import { CloseButton } from "heroui-native/close-button";
import { useThemeColor } from "heroui-native/hooks";
import { Uniwind, useUniwind } from "uniwind";

export function ThemeToggle() {
  const { theme } = useUniwind();
  const iconColor = useThemeColor("default-foreground");

  return (
    <CloseButton
      className="h-10"
      onPress={() => Uniwind.setTheme(theme === "light" ? "dark" : "light")}
    >
      <Lucide
        name={theme === "light" ? "sun" : "moon"}
        size={18}
        color={iconColor}
      />
    </CloseButton>
  );
}
