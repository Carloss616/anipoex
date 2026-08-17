import { useValue } from "@legendapp/state/react";
import Lucide from "@react-native-vector-icons/lucide";
import { CloseButton } from "@/components/ui/close-button";
import { useThemeColor } from "@/hooks/use-theme-color";
import { theme$ } from "@/state/theme";

/** Tap flips light/dark within the family; long press hands it to the system. */
export function ThemeToggle() {
  const preference = useValue(theme$.preference);
  const foreground = useThemeColor("foreground");
  const isLight = useValue(theme$.mode) === "light";

  const icon = preference === "system" ? "sun-moon" : isLight ? "sun" : "moon";

  return (
    <CloseButton
      variant="outline"
      onPress={() => theme$.preference.set(isLight ? "dark" : "light")}
      onLongPress={() => theme$.preference.set("system")}
    >
      <Lucide name={icon} size={18} color={foreground} />
    </CloseButton>
  );
}
