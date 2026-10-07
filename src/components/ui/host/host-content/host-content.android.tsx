import { Surface } from "@expo/ui/jetpack-compose";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";

/**
 * Compose's `LocalContentColor` defaults to black and `MaterialTheme` never
 * provides it — only `Surface` does. Without one, everything that inherits its
 * color stays black in dark mode: icons tinted `text-inherit`, M3's default
 * button content color, and every ripple, which reads the *ambient* value from
 * outside the button's own provider and so ignores the `colors` prop entirely.
 * Transparent, so this one carries the color and never a background.
 */
export function HostContent({ children }: { children: React.ReactNode }) {
  const m3 = useThemeM3Colors();

  return (
    <Surface color="transparent" contentColor={m3.onSurface}>
      {children}
    </Surface>
  );
}
