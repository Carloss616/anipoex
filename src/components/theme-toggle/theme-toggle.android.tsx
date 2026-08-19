import Brightness4Icon from "@expo/material-symbols/brightness_4.xml";
import DarkModeIcon from "@expo/material-symbols/dark_mode.xml";
import LightModeIcon from "@expo/material-symbols/light_mode.xml";
import { Box } from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  combinedClickable,
  size,
} from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { EnsureHost } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { theme$ } from "@/state/theme";

/**
 * Tap flips light/dark within the family; long press hands it to the system.
 *
 * Material's `IconButton` swallows long presses — its internal `clickable`
 * consumes the gesture — so this is a tonal `Box` whose only click handler is
 * `combinedClickable`, styled like the `FilledTonalIconButton` it replaces.
 */
export function ThemeToggle() {
  const preference = useValue(theme$.preference);
  const mode = useValue(theme$.mode);
  const m3 = useThemeM3Colors();
  const isLight = mode === "light";

  return (
    <EnsureHost matchContents>
      <Box
        contentAlignment="center"
        modifiers={[
          size(40, 40),
          clip({ type: "circle" }),
          background(m3.secondaryContainer),
          combinedClickable({
            onClick: () => theme$.preference.set(isLight ? "dark" : "light"),
            onLongClick: () => theme$.preference.set("system"),
          }),
        ]}
      >
        <Icon
          name={
            preference === "system"
              ? Brightness4Icon
              : isLight
                ? LightModeIcon
                : DarkModeIcon
          }
          size={18}
          color={m3.onSecondaryContainer}
        />
      </Box>
    </EnsureHost>
  );
}
