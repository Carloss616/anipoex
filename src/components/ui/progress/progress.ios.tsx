import { ProgressView } from "@expo/ui/swift-ui";
import {
  frame,
  progressViewStyle,
  scaleEffect,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { withUniwind } from "uniwind";
import { useThemeColor } from "@/hooks/use-theme-color";
import { EnsureHost } from "../host";
import type { ProgressProps } from "./progress";
import { fractionOf, ProgressHeader, TRACK_HEIGHT } from "./progress-header";

/** SwiftUI's linear `ProgressView` draws a fixed-thickness track. */
const TRACK = 4;

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
  const tintColor = useThemeColor(color);
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

/**
 * iOS Progress: same props as [the web one](./progress.tsx), rendered as a
 * linear SwiftUI `ProgressView`. `indicatorClassName` is the one prop that
 * cannot carry over — the platform draws the bar.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/progressview/
 */
export const Progress = withUniwind(ProgressBase);
