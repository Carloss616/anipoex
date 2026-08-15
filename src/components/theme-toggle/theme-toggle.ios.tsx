import { Image } from "@expo/ui/swift-ui";
import {
  contentShape,
  frame,
  glassEffect,
  onLongPressGesture,
  onTapGesture,
  shapes,
} from "@expo/ui/swift-ui/modifiers";
import { Uniwind, useUniwind } from "uniwind";
import { EnsureHost } from "@/components/ui/host";
import { useThemeColor } from "@/hooks/use-theme-color";

/**
 * Tap flips light/dark; long press hands the theme back to the system.
 *
 * A SwiftUI `Button` swallows long presses — its own gesture wins — so this is
 * a glass-styled `Image` carrying both gestures instead of our `CloseButton`.
 */
export function ThemeToggle() {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const foreground = useThemeColor("foreground");
  const isLight = theme === "light";

  return (
    <EnsureHost matchContents>
      <Image
        systemName={
          hasAdaptiveThemes
            ? "circle.lefthalf.filled"
            : isLight
              ? "sun.max"
              : "moon"
        }
        size={18}
        color={foreground}
        modifiers={[
          frame({ width: 40, height: 40 }),
          glassEffect({
            glass: { variant: "regular", interactive: true },
            shape: "circle",
          }),
          contentShape(shapes.circle()),
          onTapGesture(() => Uniwind.setTheme(isLight ? "dark" : "light")),
          onLongPressGesture(() => Uniwind.setTheme("system")),
        ]}
      />
    </EnsureHost>
  );
}
