import type { font } from "@expo/ui/swift-ui/modifiers";
import type { TypographyType } from "panelui-native/components/typography";
import type { TypographyWeight } from "./typography";

type TextStyle = Parameters<typeof font>[0]["textStyle"];

/** Weight per preset: names a font file, since our custom family has no
 * synthetic bolding to fall back on. Shared so both platforms stay in step. */
export const WEIGHT = {
  h1: "normal",
  h2: "normal",
  h3: "normal",
  h4: "normal",
  h5: "semibold",
  h6: "normal",
  lead: "normal",
  body: "normal",
  "body-sm": "normal",
  "body-xs": "normal",
  large: "semibold",
  small: "medium",
  blockquote: "normal",
  code: "normal",
} as const satisfies Record<TypographyType, TypographyWeight>;

/**
 * One row per preset. A custom family can't ride a text style alone: it needs
 * an explicit point size, with `textStyle` just the ramp it scales along — so
 * every size here is its text style's own point size, off Apple's table.
 *
 * @see https://developer.apple.com/design/human-interface-guidelines/typography
 */
export const TYPOGRAPHY_IOS = {
  h1: { textStyle: "largeTitle", size: 34 },
  h2: { textStyle: "title", size: 28 },
  h3: { textStyle: "title2", size: 22 },
  h4: { textStyle: "title3", size: 20 },
  h5: { textStyle: "headline", size: 17 },
  h6: { textStyle: "subheadline", size: 15 },
  lead: { textStyle: "title3", size: 20 },
  body: { textStyle: "body", size: 17 },
  "body-sm": { textStyle: "subheadline", size: 15 },
  "body-xs": { textStyle: "caption", size: 12 },
  large: { textStyle: "headline", size: 17 },
  small: { textStyle: "footnote", size: 13 },
  blockquote: { textStyle: "body", size: 17 },
  code: { textStyle: "body", size: 17 },
} as const satisfies Record<
  TypographyType,
  { textStyle: TextStyle; size: number }
>;
