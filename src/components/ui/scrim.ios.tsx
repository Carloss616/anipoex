import { Rectangle, VStack, ZStack } from "@expo/ui/swift-ui";
import {
  clipShape,
  fixedSize,
  foregroundStyle,
  frame,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { StyleSheet } from "react-native";
import { withUniwind } from "uniwind";
import { dp, omitUndefined } from "@/utils/utils";
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

  const insets = omitUndefined({
    all: dp(flat.padding),
    horizontal: dp(flat.paddingHorizontal),
    vertical: dp(flat.paddingVertical),
    top: dp(flat.paddingTop),
    bottom: dp(flat.paddingBottom),
    leading: dp(flat.paddingLeft ?? flat.paddingStart),
    trailing: dp(flat.paddingRight ?? flat.paddingEnd),
  });
  const radius = dp(flat.borderRadius);

  return (
    // A `Rectangle` takes every point it is offered, so without `fixedSize` the
    // wash would claim the space its content leaves behind.
    <ZStack
      alignment="bottom"
      modifiers={[fixedSize({ horizontal: false, vertical: true })]}
    >
      <Rectangle
        modifiers={[
          foregroundStyle({
            type: "linearGradient",
            colors: STOPS,
            startPoint: { x: 0.5, y: 0 },
            endPoint: { x: 0.5, y: 1 },
          }),
          ...(radius ? [clipShape("roundedRectangle", radius)] : []),
        ]}
      />
      <VStack
        spacing={dp(flat.gap ?? flat.rowGap) ?? 8}
        modifiers={[
          ...(Object.keys(insets).length ? [padding(insets)] : []),
          frame({ maxWidth: FILL }),
        ]}
      >
        {children}
      </VStack>
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
