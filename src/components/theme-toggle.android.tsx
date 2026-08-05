import BrightnessAutoIcon from "@expo/material-symbols/brightness_auto.xml";
import DarkModeIcon from "@expo/material-symbols/dark_mode.xml";
import LightModeIcon from "@expo/material-symbols/light_mode.xml";
import { Box, useMaterialColors } from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  combinedClickable,
  size,
} from "@expo/ui/jetpack-compose/modifiers";
import { useThemeColor } from "heroui-native/hooks";
import { Uniwind, useUniwind } from "uniwind";
import { Host } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";

/**
 * Tap flips light/dark; long press hands the theme back to the system.
 *
 * Material's `IconButton` swallows long presses — its internal `clickable`
 * consumes the gesture — so this is a tonal `Box` whose only click handler is
 * `combinedClickable`, styled like the `FilledTonalIconButton` it replaces.
 */
export function ThemeToggle() {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const accent = useThemeColor("accent");
  const m3 = useMaterialColors({ seedColor: accent, colorScheme: theme });
  const isLight = theme === "light";

  return (
    <Host matchContents>
      <Box
        contentAlignment="center"
        modifiers={[
          size(40, 40),
          clip({ type: "circle" }),
          background(m3.secondaryContainer),
          combinedClickable({
            onClick: () => Uniwind.setTheme(isLight ? "dark" : "light"),
            onLongClick: () => Uniwind.setTheme("system"),
          }),
        ]}
      >
        <Icon
          name={
            hasAdaptiveThemes
              ? BrightnessAutoIcon
              : isLight
                ? LightModeIcon
                : DarkModeIcon
          }
          size={18}
          color={m3.onSecondaryContainer}
        />
      </Box>
    </Host>
  );
}
