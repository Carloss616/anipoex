import {
  Text,
  type TextProps,
  useMaterialColors,
} from "@expo/ui/jetpack-compose";
import {
  background,
  clickable,
  clip,
  fillMaxWidth,
  padding,
  Shapes,
  testID as testIDModifier,
} from "@expo/ui/jetpack-compose/modifiers";
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
import { useFontFamily } from "@/hooks/use-font";
import { useThemeColor } from "@/hooks/use-theme-color";
import { textOf } from "@/utils/utils";
import { EnsureHost } from "../host";

type ComposeTextStyle = NonNullable<TextProps["style"]>;
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

/** Each M3 role's own weight. */
const PRESET_WEIGHT = {
  h1: "normal",
  h2: "normal",
  h3: "normal",
  h4: "normal",
  h5: "medium",
  h6: "medium",
  body: "normal",
  "body-sm": "normal",
  "body-xs": "normal",
  code: "normal",
} as const satisfies Record<TypographyType, TypographyWeight>;

/** A `text-*` class lands in the style, where it outranks the `align` prop. */
const STYLE_ALIGN: Record<string, TypographyAlign> = {
  left: "start",
  right: "end",
  center: "center",
  justify: "justify",
};

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
  const primary = useThemeColor("primary");
  const m3 = useMaterialColors({ seedColor: primary });

  const {
    display,
    color: styleColor,
    fontSize,
    fontWeight,
    fontFamily,
    lineHeight,
    letterSpacing,
    textAlign,
  } = StyleSheet.flatten(style as StyleProp<RNTextStyle>) ?? {};

  const isCode = type === "code";
  const themeFamily = useFontFamily(
    fontWeight ?? weight ?? PRESET_WEIGHT[type],
  );

  if (display === "none") return null;

  const alignment = STYLE_ALIGN[textAlign as string] ?? align;
  const lines = numberOfLines ?? (truncate ? 1 : undefined);

  return (
    <EnsureHost matchContents>
      <Text
        color={
          styleColor === "inherit"
            ? undefined
            : ((styleColor as string) ??
              (color === "muted" ? m3.onSurfaceVariant : m3.onSurface))
        }
        maxLines={lines}
        overflow={lines == null ? undefined : "ellipsis"}
        style={{
          // The preset is the base; everything below overrides just that key.
          typography: TYPOGRAPHY[type],
          textAlign: ALIGN[alignment],
          fontFamily: isCode ? "monospace" : (fontFamily ?? themeFamily),
          fontSize,
          lineHeight,
          letterSpacing,
        }}
        modifiers={[
          // Compose `Text` wraps its content, so a centered alignment needs the
          // full width to center within.
          ...(alignment === "start" ? [] : [fillMaxWidth()]),
          ...(testID ? [testIDModifier(testID)] : []),
          ...(onPress ? [clickable(onPress as () => void)] : []),
          ...(isCode
            ? [
                clip(Shapes.RoundedCorner(6)),
                background(m3.surfaceContainer),
                padding(6, 2, 6, 2),
              ]
            : []),
        ]}
      >
        {textOf(children)}
      </Text>
    </EnsureHost>
  );
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
