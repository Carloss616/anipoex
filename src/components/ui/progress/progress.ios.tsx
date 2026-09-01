import { ProgressView } from "@expo/ui/swift-ui";
import {
  frame,
  progressViewStyle,
  scaleEffect,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { useThemeColor } from "@/hooks/use-theme-color";
import { EnsureHost } from "../host";
import {
  formatProgressValue,
  fractionOf,
  TRACK_HEIGHT,
  TrackHeader,
} from "../track-header";
import type { ProgressProps } from "./progress";

/** SwiftUI's linear `ProgressView` draws a fixed-thickness track. */
const TRACK = 4;

/**
 * iOS Progress: same props as [the web one](./progress.tsx), rendered as a
 * linear SwiftUI `ProgressView`. `indicatorClassName` is the one prop that
 * cannot carry over — the platform draws the bar.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/progressview/
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
  const tintColor = useThemeColor(color);
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
          <ProgressView
            // Omitting the value is what makes SwiftUI's own bar indeterminate.
            value={indeterminate ? undefined : fraction}
            modifiers={[
              progressViewStyle("linear"),
              tint(tintColor),
              // `.frame` can't thicken the track — only a scale can. The frame
              // that follows hands the layout the height the scaled bar takes.
              scaleEffect({ x: 1, y: height / TRACK }),
              frame({ height }),
            ]}
            testID={testID}
          />
        }
      />
    </EnsureHost>
  );
}
