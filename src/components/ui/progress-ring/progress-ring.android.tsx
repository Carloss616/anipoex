import { Box } from "@expo/ui/jetpack-compose";
import { size as sizeModifier } from "@expo/ui/jetpack-compose/modifiers";
import { CircularWavyProgressIndicator } from "@/components/native/jetpack-compose/circular-wavy-progress-indicator";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { EnsureHost } from "../host";
import { Icon } from "../icon";
import type { ProgressRingProps } from "./progress-ring";

/**
 * M3 Expressive's wavy ring, thinner than its default for a row's button.
 */
export function ProgressRing({
  value,
  size = 24,
  icon,
  paused,
  stroke = 2.5,
}: ProgressRingProps) {
  const m3 = useThemeM3Colors();

  return (
    <EnsureHost matchContents>
      <Box contentAlignment="center">
        <CircularWavyProgressIndicator
          progress={value}
          color={m3.primary}
          trackColor={m3.surfaceContainerHighest}
          // M3's 4dp reads heavy on a ring this small.
          strokeWidth={stroke}
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
