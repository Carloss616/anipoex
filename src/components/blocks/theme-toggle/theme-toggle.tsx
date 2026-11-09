import { useValue } from "@legendapp/state/react";
import { Button } from "panelui-web/button";
import { Icon } from "@/components/ui/icon";
import { settings$ } from "@/state/settings";
import { themeMode$ } from "@/state/theme";

/** Click flips light/dark in the family; right-click hands it to the system. */
export function ThemeToggle() {
  const preference = useValue(settings$.theme.preference);
  const isLight = useValue(themeMode$) === "light";

  const icon = preference === "system" ? "sun-moon" : isLight ? "sun" : "moon";

  return (
    <Button
      variant="outline"
      size="icon"
      shape="pill"
      aria-label={`Switch to ${isLight ? "dark" : "light"} theme`}
      onClick={() => settings$.theme.preference.set(isLight ? "dark" : "light")}
      onContextMenu={(event) => {
        event.preventDefault();
        settings$.theme.preference.set("system");
      }}
    >
      <Icon name={icon} />
    </Button>
  );
}
