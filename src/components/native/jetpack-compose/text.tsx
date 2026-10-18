import { Text as TextBase, type TextProps } from "@expo/ui/jetpack-compose";
import { useFontFamily } from "@/hooks/use-font";

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
 * Compose's `Text` in the app's font, and nothing else: size comes from
 * `style.typography` (M3's `bodyLarge` when unset), color from
 * `LocalContentColor` unless the caller passes one. The family ships one file
 * per weight, so `style.fontWeight` picks the file instead of reaching Compose,
 * which would bold it again. Nested spans are `@expo/ui`'s own `Text`.
 *
 * @see https://docs.expo.dev/versions/v58.0.0/sdk/ui/jetpack-compose/text/
 */
export function Text({ style, ...props }: TextProps) {
  const { fontWeight, ...rest } = style ?? {};
  const fontFamily = useFontFamily(
    fontWeight ??
      (MEDIUM.has(style?.typography ?? "bodyLarge") ? "medium" : "normal"),
  );

  return <TextBase {...props} style={{ fontFamily, ...rest }} />;
}
