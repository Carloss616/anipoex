import { Text, type TextProps } from "@expo/ui/jetpack-compose";
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
  TypographyCodeProps,
  TypographyHeadingProps,
  TypographyParagraphProps,
  TypographyProps,
  TypographyType,
} from "panelui-native/components/typography";
import { StyleSheet } from "react-native";
import { withUniwind } from "uniwind";
import { useFontFamily } from "@/hooks/use-font";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { dp, textOf } from "@/utils/utils";
import { EnsureHost } from "../host";
import { WEIGHT } from "./constants";

type ComposeTextStyle = NonNullable<TextProps["style"]>;
type TypographyStyle = NonNullable<ComposeTextStyle["typography"]>;

/**
 * One row per preset: the Material 3 style, picked by nearest size to PanelUI's
 * scale. Sizes come from the M3 style itself; weights from `WEIGHT`.
 *
 * @see https://m3.material.io/styles/typography/type-scale-tokens
 */
const TYPOGRAPHY = {
  h1: "displaySmall",
  h2: "headlineLarge",
  h3: "headlineSmall",
  h4: "titleLarge",
  h5: "titleMedium",
  h6: "titleMedium",
  lead: "titleLarge",
  body: "bodyLarge",
  "body-sm": "bodyMedium",
  "body-xs": "bodySmall",
  large: "titleMedium",
  small: "bodySmall",
  blockquote: "bodyLarge",
  code: "bodyMedium",
} as const satisfies Record<TypographyType, TypographyStyle>;

function TypographyRootBase({
  children,
  type = "body",
  align,
  muted = false,
  weight,
  numberOfLines,
  style,
  onPress,
  testID,
  modifiers,
}: TypographyProps) {
  const m3 = useThemeM3Colors();

  const {
    display,
    color: styleColor,
    fontSize,
    fontWeight,
    fontFamily,
    lineHeight,
    letterSpacing,
    textAlign,
    padding: paddingSize,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    paddingVertical,
    paddingHorizontal,
  } = StyleSheet.flatten(style) ?? {};

  const themeFamily = useFontFamily(fontWeight ?? weight ?? WEIGHT[type]);

  if (display === "none") return null;

  const isCode = type === "code";
  const alignment = textAlign === "auto" ? undefined : (textAlign ?? align);
  const pl =
    dp(paddingSize ?? paddingHorizontal ?? paddingLeft) ?? (isCode ? 6 : 0);
  const pt =
    dp(paddingSize ?? paddingVertical ?? paddingTop) ?? (isCode ? 2 : 0);
  const pr =
    dp(paddingSize ?? paddingHorizontal ?? paddingRight) ?? (isCode ? 6 : 0);
  const pb =
    dp(paddingSize ?? paddingVertical ?? paddingBottom) ?? (isCode ? 2 : 0);

  return (
    <EnsureHost matchContents>
      <Text
        color={
          styleColor === "inherit"
            ? undefined
            : ((styleColor as string) ??
              (muted ? m3.onSurfaceVariant : m3.onSurface))
        }
        maxLines={numberOfLines}
        overflow={numberOfLines == null ? undefined : "ellipsis"}
        style={{
          typography: TYPOGRAPHY[type],
          textAlign: alignment ?? "start",
          fontFamily: isCode ? "monospace" : (fontFamily ?? themeFamily),
          fontSize,
          lineHeight,
          letterSpacing,
        }}
        modifiers={[
          // Compose `Text` wraps its content, so a centered alignment needs the
          // full width to center within.
          ...(alignment == null || alignment === "left"
            ? []
            : [fillMaxWidth()]),
          ...(testID ? [testIDModifier(testID)] : []),
          ...(onPress ? [clickable(onPress as () => void)] : []),
          ...(pl || pt || pr || pb ? [padding(pl, pt, pr, pb)] : []),
          ...(isCode
            ? [clip(Shapes.RoundedCorner(6)), background(m3.surfaceContainer)]
            : []),
          ...(modifiers ?? []),
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
 * Android Typography: same props as PanelUI's, rendered as a Jetpack
 * Compose `Text` on top of the Material 3 typography scale.
 *
 * @see https://panelui.dev/docs/components/typography
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/text/
 */
export const Typography = Object.assign(TypographyRoot, {
  Heading: TypographyHeading,
  Paragraph: TypographyParagraph,
  Code: TypographyCode,
});
