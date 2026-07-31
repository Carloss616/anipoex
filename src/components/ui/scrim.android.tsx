import { Box, Column } from "@expo/ui/jetpack-compose";
import {
  background,
  fillMaxWidth,
  matchParentSize,
  padding,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { StyleSheet } from "react-native";
import { withUniwind } from "uniwind";
import { dp } from "@/utils/utils";
import type { ScrimProps } from "./scrim";

/** `global.css`'s `scrim` alphas, top to bottom, evenly spaced. */
const STOPS = [0, 0.024, 0.1, 0.22, 0.38, 0.6];

/**
 * `@expo/ui` exposes no gradient brush on the Compose side, and hosting React
 * Native's `LinearGradient` here swallows the card's taps — the host claims
 * every gesture handed to it. So the ramp is stacked bands; over the height of
 * a caption each one is a fraction of a dp and the steps disappear.
 */
const BANDS = 6;

const alphaAt = (band: number) => {
  const t = (band / (BANDS - 1)) * (STOPS.length - 1);
  const i = Math.min(Math.floor(t), STOPS.length - 2);
  return STOPS[i] + (STOPS[i + 1] - STOPS[i]) * (t - i);
};

/** Alpha goes last, as in React Native — `#AARRGGBB` reads as fully clear. */
const hex = (alpha: number) =>
  `#000000${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0")}`;

function ScrimBase({ children, style }: ScrimProps) {
  const flat = StyleSheet.flatten(style) ?? {};
  const all = dp(flat.padding) ?? 0;
  const horizontal = dp(flat.paddingHorizontal) ?? all;
  const vertical = dp(flat.paddingVertical) ?? all;

  return (
    <Box modifiers={[fillMaxWidth()]}>
      {/* `matchParentSize` keeps the ramp out of the box's measurement, so the
          content is what sets the height. */}
      <Column modifiers={[matchParentSize()]}>
        {Array.from({ length: BANDS }, (_band, i) => (
          <Box
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length ramp
            key={i}
            modifiers={[fillMaxWidth(), weight(1), background(hex(alphaAt(i)))]}
          />
        ))}
      </Column>
      <Column
        modifiers={[
          fillMaxWidth(),
          padding(
            dp(flat.paddingLeft ?? flat.paddingStart) ?? horizontal,
            dp(flat.paddingTop) ?? vertical,
            dp(flat.paddingRight ?? flat.paddingEnd) ?? horizontal,
            dp(flat.paddingBottom) ?? vertical,
          ),
        ]}
        verticalArrangement={{ spacedBy: dp(flat.gap ?? flat.rowGap) ?? 8 }}
      >
        {children}
      </Column>
    </Box>
  );
}

export const Scrim = withUniwind(ScrimBase);
