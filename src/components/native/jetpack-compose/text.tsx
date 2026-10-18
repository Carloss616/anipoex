import { Text as TextBase, type TextProps } from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  padding,
  Shapes,
} from "@expo/ui/jetpack-compose/modifiers";
import { useFontFamily } from "@/hooks/use-font";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";

type Typography = NonNullable<NonNullable<TextProps["style"]>["typography"]>;

/**
 * The M3 styles set in medium; every other one is regular.
 *
 * @see https://m3.material.io/styles/typography/type-scale-tokens
 */
const MEDIUM = new Set<Typography>([
  "titleMedium",
  "titleSmall",
  "labelLarge",
  "labelMedium",
  "labelSmall",
]);

/**
 * Compose's `Text` in the app's font, and nothing else: color stays
 * `LocalContentColor` or the caller's. `typography` defaults to `bodyLarge`,
 * which the Host doesn't provide. Nested spans are `@expo/ui`'s own `Text`.
 *
 * @see https://docs.expo.dev/versions/v58.0.0/sdk/ui/jetpack-compose/text/
 */
export function Text({ style, ...props }: TextProps) {
  const { fontWeight, typography = "bodyLarge", ...rest } = style ?? {};
  const fontFamily = useFontFamily(
    fontWeight ?? (MEDIUM.has(typography) ? "medium" : "normal"),
  );

  return <TextBase {...props} style={{ typography, fontFamily, ...rest }} />;
}

/** A `bodyMedium` `Text` on a rounded chip, for a value read as data — `176/266`. */
export function Code({ style, modifiers, ...props }: TextProps) {
  const m3 = useThemeM3Colors();

  return (
    <Text
      style={{ typography: "bodyMedium", ...style }}
      modifiers={[
        clip(Shapes.RoundedCorner(6)),
        background(m3.surfaceContainer),
        padding(6, 2, 6, 2),
        ...(modifiers ?? []),
      ]}
      {...props}
    />
  );
}
