import { ProgressView } from "@expo/ui/swift-ui";
import {
  frame,
  progressViewStyle,
  scaleEffect,
} from "@expo/ui/swift-ui/modifiers";
import { StyleSheet } from "react-native";
import { withUniwind } from "uniwind";
import { dp } from "@/utils/utils";
import { Host, useIsInsideHost } from "./host";
import type { ProgressProps } from "./progress";

/** SwiftUI's linear `ProgressView` draws a fixed-thickness track. */
const TRACK = 4;

function ProgressBase({ value, style, testID }: ProgressProps) {
  const isInsideHost = useIsInsideHost();
  const height = dp(StyleSheet.flatten(style)?.height);

  const progress = (
    <ProgressView
      value={value}
      modifiers={[
        progressViewStyle("linear"),
        // `.frame` can't thicken the track — only a scale can. The frame that
        // follows just hands the layout the height the scaled bar now takes.
        ...(height
          ? [scaleEffect({ x: 1, y: height / TRACK }), frame({ height })]
          : []),
      ]}
      testID={testID}
    />
  );

  return isInsideHost ? progress : <Host className="w-full">{progress}</Host>;
}

/**
 * iOS Progress: same props as [the web one](./progress.tsx), rendered as a
 * linear SwiftUI `ProgressView`.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/progressview/
 */
export const Progress = withUniwind(ProgressBase);
