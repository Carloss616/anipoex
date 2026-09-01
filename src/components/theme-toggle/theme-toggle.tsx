import { useValue } from "@legendapp/state/react";
import { CloseButton } from "@/components/ui/close-button";
import { theme$ } from "@/state/theme";
import { Icon } from "../ui/icon/icon";

/** Tap flips light/dark within the family; long press hands it to the system. */
export function ThemeToggle() {
  const preference = useValue(theme$.preference);
  const isLight = useValue(theme$.mode) === "light";

  const icon = preference === "system" ? "sun-moon" : isLight ? "sun" : "moon";

  return (
    <CloseButton
      variant="outline"
      onPress={() => theme$.preference.set(isLight ? "dark" : "light")}
      onLongPress={() => theme$.preference.set("system")}
    >
      <Icon name={icon} size={18} />
    </CloseButton>
  );
}
