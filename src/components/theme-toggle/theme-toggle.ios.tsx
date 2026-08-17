import { Image } from "@expo/ui/swift-ui";
import {
  contentShape,
  frame,
  glassEffect,
  onLongPressGesture,
  onTapGesture,
  shapes,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { EnsureHost } from "@/components/ui/host";
import { useThemeColor } from "@/hooks/use-theme-color";
import { theme$ } from "@/state/theme";

/**
 * Tap flips light/dark within the family; long press hands it to the system.
 *
 * A SwiftUI `Button` swallows long presses — its own gesture wins — so this is
 * a glass-styled `Image` carrying both gestures instead of our `CloseButton`.
 */
export function ThemeToggle() {
  const preference = useValue(theme$.preference);
  const foreground = useThemeColor("foreground");
  const isLight = useValue(theme$.mode) === "light";

  return (
    <EnsureHost matchContents>
      <Image
        systemName={
          preference === "system"
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
          onTapGesture(() => theme$.preference.set(isLight ? "dark" : "light")),
          onLongPressGesture(() => theme$.preference.set("system")),
        ]}
      />
    </EnsureHost>
  );
}
