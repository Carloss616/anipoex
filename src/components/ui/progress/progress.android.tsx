import { LinearWavyProgressIndicator } from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  height as heightModifier,
  testID as testIDModifier,
} from "@expo/ui/jetpack-compose/modifiers";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { EnsureHost } from "../host";
import {
  formatProgressValue,
  fractionOf,
  TRACK_HEIGHT,
  TrackHeader,
} from "../track-header";
import type { ProgressProps } from "./progress";

/**
 * Android Progress: same props as [the web one](./progress.tsx), rendered as
 * M3's `LinearWavyProgressIndicator`. `indicatorClassName` is the one prop that
 * cannot carry over — the platform draws the bar.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/progress/
 */
export function Progress({
  value = 0,
  minValue = 0,
  maxValue = 100,
  indeterminate = false,
  color = "primary",
  size = "md",
  label,
  showValueLabel = false,
  valueLabel,
  formatOptions,
  headerClassName,
  testID,
}: ProgressProps) {
  const m3 = useThemeM3Colors(color);
  const height = TRACK_HEIGHT[size];
  const fraction = fractionOf(value, minValue, maxValue);

  return (
    <EnsureHost matchContents={{ vertical: true }} className="w-full">
      <TrackHeader
        label={label}
        headerClassName={headerClassName}
        valueLabel={
          showValueLabel && !indeterminate
            ? formatProgressValue(value, fraction, valueLabel, formatOptions)
            : undefined
        }
        track={
          <LinearWavyProgressIndicator
            // Omitting the progress is what makes M3's own bar indeterminate.
            progress={indeterminate ? undefined : fraction}
            color={m3.primary}
            trackColor={m3.surfaceContainerHighest}
            modifiers={[
              fillMaxWidth(),
              heightModifier(height),
              ...(testID ? [testIDModifier(testID)] : []),
            ]}
          />
        }
      />
    </EnsureHost>
  );
}
