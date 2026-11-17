import { Box, CircularWavyProgressIndicator } from "@expo/ui/jetpack-compose";
import { size as sizeModifier } from "@expo/ui/jetpack-compose/modifiers";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { EnsureHost } from "../host";
import { Icon } from "../icon";
import type { ProgressRingProps } from "./progress-ring";

/**
 * M3 Expressive's wavy ring.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/progress/
 */
export function ProgressRing({
  value,
  size = 20,
  icon,
  paused,
}: ProgressRingProps) {
  const m3 = useThemeM3Colors();

  return (
    <EnsureHost matchContents>
      <Box contentAlignment="center">
        <CircularWavyProgressIndicator
          progress={value}
          color={m3.primary}
          trackColor={m3.surfaceContainerHighest}
          waveSpeed={paused ? 0 : undefined}
          modifiers={[sizeModifier(size, size)]}
        />
        {icon && (
          <Icon name={icon} size={Math.round(size / 2)} color={m3.primary} />
        )}
      </Box>
    </EnsureHost>
  );
}
