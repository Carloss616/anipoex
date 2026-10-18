import {
  Text as TextBase,
  type TextProps as TextBaseProps,
} from "@expo/ui/swift-ui";
import { font } from "@expo/ui/swift-ui/modifiers";
import type { TypographyWeight } from "@/components/ui/typography";
import { useFontFamily } from "@/hooks/use-font";

type Font = Parameters<typeof font>[0];
export type TextStyle = NonNullable<Font["textStyle"]>;
export type TextWeight = NonNullable<Font["weight"]>;

/**
 * Apple's point size and weight per text style, at the default Dynamic Type
 * size. A custom family can't ride a text style alone — it needs the size
 * spelled out, and `textStyle` is only the ramp it scales along.
 *
 * @see https://developer.apple.com/design/human-interface-guidelines/typography#Specifications
 */
const SCALE = {
  largeTitle: { size: 34, weight: "regular" },
  title: { size: 28, weight: "regular" },
  title2: { size: 22, weight: "regular" },
  title3: { size: 20, weight: "regular" },
  headline: { size: 17, weight: "semibold" },
  body: { size: 17, weight: "regular" },
  callout: { size: 16, weight: "regular" },
  subheadline: { size: 15, weight: "regular" },
  footnote: { size: 13, weight: "regular" },
  caption: { size: 12, weight: "regular" },
  caption2: { size: 11, weight: "regular" },
} as const satisfies Record<TextStyle, { size: number; weight: TextWeight }>;

/** The app's family ships four files and no synthetic bolding. */
const FILE = {
  ultraLight: "normal",
  thin: "normal",
  light: "normal",
  regular: "normal",
  medium: "medium",
  semibold: "semibold",
  bold: "bold",
  heavy: "bold",
  black: "bold",
} as const satisfies Record<TextWeight, TypographyWeight>;

/**
 * The app's font as a `font` modifier, for what SwiftUI labels itself — a
 * `Button`'s `label`, a `Picker` — where there is no `Text` of ours to set it.
 */
export function useFont(textStyle: TextStyle = "body", weight?: TextWeight) {
  const scale = SCALE[textStyle];
  const family = useFontFamily(FILE[weight ?? scale.weight]);

  return font({ textStyle, size: scale.size, family });
}

export interface TextProps extends TextBaseProps {
  /** @default "body" */
  textStyle?: TextStyle;
  /** Defaults to the text style's own weight — `headline` is semibold. */
  weight?: TextWeight;
}

/**
 * SwiftUI's `Text` in the app's font, and nothing else: color, alignment and
 * line limits stay the environment's or the caller's modifiers. Nested spans
 * are `@expo/ui`'s own `Text`.
 *
 * @see https://docs.expo.dev/versions/v58.0.0/sdk/ui/swift-ui/text/
 */
export function Text({
  textStyle = "body",
  weight,
  modifiers,
  ...props
}: TextProps) {
  return (
    <TextBase
      modifiers={[useFont(textStyle, weight), ...(modifiers ?? [])]}
      {...props}
    />
  );
}
