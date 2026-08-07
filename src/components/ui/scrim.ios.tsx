import { Rectangle, ZStack } from "@expo/ui/swift-ui";
import {
  clipShape,
  fixedSize,
  foregroundStyle,
  frame,
} from "@expo/ui/swift-ui/modifiers";
import { StyleSheet } from "react-native";
import { withUniwind } from "uniwind";
import { dp } from "@/utils/utils";
import { Column } from "../layout/column";
import type { ScrimProps } from "./scrim";

/** `global.css`'s `scrim` stops, top to bottom. Alpha goes last, as in RN. */
const STOPS = [
  "#00000000",
  "#00000006",
  "#0000001A",
  "#00000038",
  "#00000061",
  "#00000099",
];

/** Stands in for `.infinity`, which doesn't survive the props bridge. */
const FILL = 100_000;

function ScrimBase({ children, style }: ScrimProps) {
  const flat = StyleSheet.flatten(style) ?? {};
  const radius = dp(flat.borderRadius);

  return (
    // A `Rectangle` takes every point it is offered, so without `fixedSize` the
    // wash would claim the space its content leaves behind.
    <ZStack
      alignment="bottom"
      modifiers={[
        fixedSize({ horizontal: false, vertical: true }),
        ...(radius ? [clipShape("roundedRectangle", radius)] : []),
      ]}
    >
      <Rectangle
        modifiers={[
          foregroundStyle({
            type: "linearGradient",
            colors: STOPS,
            startPoint: { x: 0.5, y: 0 },
            endPoint: { x: 0.5, y: 1 },
          }),
        ]}
      />
      <Column modifiers={[frame({ maxWidth: FILL })]} style={flat}>
        {children}
      </Column>
    </ZStack>
  );
}

/**
 * iOS Scrim: same props as [the web one](./scrim.tsx), drawn as a gradient
 * `Rectangle` behind a SwiftUI `ZStack` of content.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/zstack/
 */
export const Scrim = withUniwind(ScrimBase);
