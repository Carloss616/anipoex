import { Text } from "@expo/ui/swift-ui";
import {
  background,
  cornerRadius,
  font,
  foregroundStyle,
  kerning,
  lineLimit,
  multilineTextAlignment,
  onTapGesture,
  padding,
} from "@expo/ui/swift-ui/modifiers";
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

type FontParams = Parameters<typeof font>[0];
type FontWeight = NonNullable<FontParams["weight"]>;

/** SwiftUI text styles — the iOS preset ramp, so text follows Dynamic Type. */
const TEXT_STYLE = {
  h1: "largeTitle",
  h2: "title",
  h3: "title2",
  h4: "title3",
  h5: "headline",
  h6: "subheadline",
  body: "body",
  "body-sm": "subheadline",
  "body-xs": "footnote",
  code: "body",
} as const satisfies Record<TypographyType, FontParams["textStyle"]>;

const WEIGHT = {
  normal: "regular",
  medium: "medium",
  semibold: "semibold",
  bold: "bold",
} as const satisfies Record<TypographyWeight, FontWeight>;

/** RN weights, including the numbers uniwind resolves `font-semibold` & co. to. */
const RN_WEIGHT: Record<string, FontWeight> = {
  "100": "ultraLight",
  "200": "thin",
  "300": "light",
  "400": "regular",
  "500": "medium",
  "600": "semibold",
  "700": "bold",
  "800": "heavy",
  "900": "black",
  normal: "regular",
  bold: "bold",
};

// `leading`/`trailing` are already RTL-aware; SwiftUI has no justified alignment.
const ALIGN = {
  start: "leading",
  center: "center",
  end: "trailing",
  justify: "leading",
} as const satisfies Record<TypographyAlign, "leading" | "center" | "trailing">;

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
    letterSpacing,
  } = StyleSheet.flatten(style as StyleProp<RNTextStyle>) ?? {};
  
  if (display === "none") return null;

  const isCode = type === "code";
  const isHeading = type.startsWith("h");
  const lines = numberOfLines ?? (truncate ? 1 : undefined);

  const content = (
    <Text
      testID={testID}
      modifiers={[
        font({
          // An explicit size opts out of the preset — Dynamic Type can't scale a fixed size.
          textStyle: fontSize == null ? TEXT_STYLE[type] : undefined,
          size: fontSize,
          family: fontFamily,
          weight:
            RN_WEIGHT[String(fontWeight)] ??
            WEIGHT[weight ?? (isHeading ? "semibold" : "normal")],
          design: isCode ? "monospaced" : undefined,
        }),
        foregroundStyle(
          (styleColor as string) ?? (color === "muted" ? muted : foreground),
        ),
        multilineTextAlignment(ALIGN[align]),
        ...(letterSpacing == null ? [] : [kerning(letterSpacing)]),
        ...(lines == null ? [] : [lineLimit(lines)]),
        ...(onPress == null ? [] : [onTapGesture(onPress as () => void)]),
        ...(isCode
          ? [
              padding({ horizontal: 6, vertical: 2 }),
              background(defaultColor),
              cornerRadius(6),
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
 * iOS Typography: same props as `heroui-native`'s, rendered as a SwiftUI `Text`.
 *
 * @see https://heroui.com/docs/native/components/text
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/text/
 */
export const Typography = Object.assign(TypographyRoot, {
  Heading: TypographyHeading,
  Paragraph: TypographyParagraph,
  Code: TypographyCode,
});
