import { Surface } from "@expo/ui/jetpack-compose";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";

/**
 * Compose's `LocalContentColor` defaults to black and only `Surface` provides
 * it: without one, `text-inherit` icons, M3's default button content and every
 * ripple (it reads the ambient value, ignoring `colors`) stay black in dark
 * mode. Transparent: it carries the color, never a background.
 */
export function HostContent({ children }: { children: React.ReactNode }) {
  const m3 = useThemeM3Colors();

  return (
    <Surface color="transparent" contentColor={m3.onSurface}>
      {children}
    </Surface>
  );
}
