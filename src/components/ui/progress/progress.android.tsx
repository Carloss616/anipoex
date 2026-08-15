import {
  LinearWavyProgressIndicator,
  useMaterialColors,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  height as heightModifier,
  testID as testIDModifier,
} from "@expo/ui/jetpack-compose/modifiers";
import { withUniwind } from "uniwind";
import { useThemeColor } from "@/hooks/use-theme-color";
import { EnsureHost } from "../host";
import type { ProgressProps } from "./progress";
import { fractionOf, ProgressHeader, TRACK_HEIGHT } from "./progress-header";

function ProgressBase({
  value = 0,
  minValue = 0,
  maxValue = 100,
  indeterminate = false,
  color = "primary",
  size = "md",
  testID,
  ...props
}: ProgressProps) {
  const seedColor = useThemeColor(color);
  const m3 = useMaterialColors({ seedColor });
  const height = TRACK_HEIGHT[size];
  const fraction = fractionOf(value, minValue, maxValue);

  return (
    <EnsureHost matchContents={{ vertical: true }} className="w-full">
      <ProgressHeader
        {...props}
        value={value}
        minValue={minValue}
        maxValue={maxValue}
        indeterminate={indeterminate}
        fraction={fraction}
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

/**
 * Android Progress: same props as [the web one](./progress.tsx), rendered as
 * M3's `LinearWavyProgressIndicator`. `indicatorClassName` is the one prop that
 * cannot carry over — the platform draws the bar.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/progress/
 */
export const Progress = withUniwind(ProgressBase);
