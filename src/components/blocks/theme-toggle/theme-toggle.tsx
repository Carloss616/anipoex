import { useValue } from "@legendapp/state/react";
import { Button } from "panelui-web/button";
import { Icon } from "@/components/ui/icon";
import { theme$ } from "@/state/theme";

/** Click flips light/dark in the family; right-click hands it to the system. */
export function ThemeToggle() {
  const preference = useValue(theme$.preference);
  const isLight = useValue(theme$.mode) === "light";

  const icon = preference === "system" ? "sun-moon" : isLight ? "sun" : "moon";

  return (
    <Button
      variant="outline"
      size="icon"
      shape="pill"
      aria-label={`Switch to ${isLight ? "dark" : "light"} theme`}
      onClick={() => theme$.preference.set(isLight ? "dark" : "light")}
      onContextMenu={(event) => {
        event.preventDefault();
        theme$.preference.set("system");
      }}
    >
      <Icon name={icon} />
    </Button>
  );
}
