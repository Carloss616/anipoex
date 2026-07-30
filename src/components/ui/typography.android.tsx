import { Text, type TextProps } from "@expo/ui/jetpack-compose";
import {
  background,
  clickable,
  clip,
  padding,
  Shapes,
  testID as testIDModifier,
} from "@expo/ui/jetpack-compose/modifiers";
import { useThemeColor } from "heroui-native/hooks";
import type {
  TypographyAlign,
  TypographyCodeProps,
  TypographyHeadingProps,
  TypographyParagraphProps,
  TypographyRootProps,
  TypographyType,
  TypographyWeight,
} from "heroui-native/text";
import {
  type TextStyle as RNTextStyle,
  type StyleProp,
  StyleSheet,
} from "react-native";
import { withUniwind } from "uniwind";
import { textOf } from "@/utils/utils";
import { Host, useIsInsideHost } from "./host";

type ComposeTextStyle = NonNullable<TextProps["style"]>;
type TextFontWeight = NonNullable<ComposeTextStyle["fontWeight"]>;
type TypographyStyle = NonNullable<ComposeTextStyle["typography"]>;

/**
 * Material 3 typography presets, picked by nearest size to heroui's scale.
 * M3 has no 18sp step, so h5 and h6 share `titleMedium`.
 */
const TYPOGRAPHY = {
  h1: "displaySmall",
  h2: "headlineLarge",
  h3: "headlineSmall",
  h4: "titleLarge",
  h5: "titleMedium",
  h6: "titleMedium",
  body: "bodyLarge",
  "body-sm": "bodyMedium",
  "body-xs": "bodySmall",
  code: "bodyMedium",
} as const satisfies Record<TypographyType, TypographyStyle>;

const WEIGHT = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const satisfies Record<TypographyWeight, TextFontWeight>;

const ALIGN = {
  start: "start",
  center: "center",
  end: "end",
  justify: "justify",
} as const satisfies Record<TypographyAlign, string>;

function TypographyRootBase({
  children,
  type = "body",
  align = "start",
  color = "default",
  weight,
  truncate = false,
  numberOfLines,
  style,
  onPress,
  testID,
}: TypographyRootProps) {
  const [foreground, muted, defaultColor] = useThemeColor([
    "foreground",
    "muted",
    "default",
  ]);
  const isInsideHost = useIsInsideHost();

  const {
    display,
    color: styleColor,
    fontSize,
    fontWeight,
    fontFamily,
    lineHeight,
    letterSpacing,
  } = StyleSheet.flatten(style as StyleProp<RNTextStyle>) ?? {};
  
  if (display === "none") return null;

  const isCode = type === "code";
  const isHeading = type.startsWith("h");
  const lines = numberOfLines ?? (truncate ? 1 : undefined);

  const content = (
    <Text
      color={(styleColor as string) ?? (color === "muted" ? muted : foreground)}
      maxLines={lines}
      overflow={lines == null ? undefined : "ellipsis"}
      style={{
        // The preset is the base; everything below overrides just that key.
        typography: TYPOGRAPHY[type],
        textAlign: ALIGN[align],
        // Compose wants '600', uniwind resolves `font-semibold` to 600.
        fontWeight:
          fontWeight == null
            ? WEIGHT[weight ?? (isHeading ? "semibold" : "normal")]
            : (String(fontWeight) as TextFontWeight),
        fontFamily: isCode ? "monospace" : fontFamily,
        fontSize,
        lineHeight,
        letterSpacing,
      }}
      modifiers={[
        ...(testID ? [testIDModifier(testID)] : []),
        ...(onPress ? [clickable(onPress as () => void)] : []),
        ...(isCode
          ? [
              clip(Shapes.RoundedCorner(6)),
              background(defaultColor),
              padding(6, 2, 6, 2),
            ]
          : []),
      ]}
    >
      {textOf(children)}
    </Text>
  );

  return isInsideHost ? content : <Host matchContents>{content}</Host>;
}

const TypographyRoot = withUniwind(TypographyRootBase);

function TypographyHeading({ type = "h1", ...props }: TypographyHeadingProps) {
  return <TypographyRoot type={type} {...props} />;
}

function TypographyParagraph({
  type = "body",
  ...props
}: TypographyParagraphProps) {
  return <TypographyRoot type={type} {...props} />;
}

function TypographyCode(props: TypographyCodeProps) {
  return <TypographyRoot type="code" {...props} />;
}

/**
 * Android Typography: same props as `heroui-native`'s, rendered as a Jetpack
 * Compose `Text` on top of the Material 3 typography scale.
 *
 * @see https://heroui.com/docs/native/components/text
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/text/
 */
export const Typography = Object.assign(TypographyRoot, {
  Heading: TypographyHeading,
  Paragraph: TypographyParagraph,
  Code: TypographyCode,
});
