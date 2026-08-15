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
import { useThemeColor } from "@/hooks/use-theme-color";
import { textOf } from "@/utils/utils";
import { EnsureHost } from "../host";
import type { TypographyWeight } from "./typography";

type ComposeTextStyle = NonNullable<TextProps["style"]>;
type TypographyStyle = NonNullable<ComposeTextStyle["typography"]>;

/**
 * Material 3 typography presets, picked by nearest size to PanelUI's scale.
 * M3 has no 18sp step, so h5 and h6 share `titleMedium`.
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

/** Each M3 role's own weight. */
const PRESET_WEIGHT = {
  h1: "normal",
  h2: "normal",
  h3: "normal",
  h4: "normal",
  h5: "medium",
  h6: "medium",
  lead: "normal",
  body: "normal",
  "body-sm": "normal",
  "body-xs": "normal",
  large: "semibold",
  small: "medium",
  blockquote: "normal",
  code: "normal",
} as const satisfies Record<TypographyType, TypographyWeight>;

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
          // The preset is the base; everything below overrides just that key.
          typography: TYPOGRAPHY[type],
          // Unset means natural alignment, which Compose spells `start`.
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
