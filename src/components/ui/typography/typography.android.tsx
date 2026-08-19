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
import {
  type TextStyle as RNTextStyle,
  type StyleProp,
  StyleSheet,
} from "react-native";
import { withUniwind } from "uniwind";
import { useFontFamily } from "@/hooks/use-font";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { textOf } from "@/utils/utils";
import { EnsureHost } from "../host";
import { PRESET_WEIGHT } from "./constants";

type ComposeTextStyle = NonNullable<TextProps["style"]>;
type TypographyStyle = NonNullable<ComposeTextStyle["typography"]>;

/** Material 3 typography presets, picked by nearest size to PanelUI's scale. */
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
  } = StyleSheet.flatten(style as StyleProp<RNTextStyle>) ?? {};

  const isCode = type === "code";
  const themeFamily = useFontFamily(
    fontWeight ?? weight ?? PRESET_WEIGHT[type],
  );

  if (display === "none") return null;

  const alignment = textAlign === "auto" ? undefined : (textAlign ?? align);

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
