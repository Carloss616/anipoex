import { Text } from "@expo/ui/swift-ui";
import {
  background,
  cornerRadius,
  fixedSize,
  font,
  foregroundStyle,
  frame,
  kerning,
  lineLimit,
  multilineTextAlignment,
  onTapGesture,
  padding,
} from "@expo/ui/swift-ui/modifiers";
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
import { PRESET_WEIGHT, TEXT_SIZE } from "./constants";

type FontParams = Parameters<typeof font>[0];

/** SwiftUI text styles — the iOS preset ramp, so text follows Dynamic Type. */
const TEXT_STYLE = {
  h1: "largeTitle",
  h2: "title",
  h3: "title2",
  h4: "title3",
  h5: "headline",
  h6: "subheadline",
  lead: "title3",
  body: "body",
  "body-sm": "subheadline",
  "body-xs": "footnote",
  large: "headline",
  small: "footnote",
  blockquote: "body",
  code: "body",
} as const satisfies Record<TypographyType, FontParams["textStyle"]>;

/** Stands in for `.infinity`, which doesn't survive the props bridge. */
const FILL = 100_000;

type TypographyAlign = NonNullable<TypographyProps["align"]>;

// `leading`/`trailing` are the RTL-aware pair, so an unset `align` maps to
// `leading` rather than to a side — matching the natural alignment RN gives
// a Text with no `textAlign`.
const ALIGN = {
  left: "leading",
  center: "center",
  right: "trailing",
} as const satisfies Record<TypographyAlign, "leading" | "center" | "trailing">;

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
  const secondary = useThemeColor("secondary");

  const {
    display,
    color: styleColor,
    fontSize,
    fontWeight,
    fontFamily,
    letterSpacing,
    textAlign,
  } = StyleSheet.flatten(style as StyleProp<RNTextStyle>) ?? {};

  const isCode = type === "code";
  const themeFamily = useFontFamily(
    fontWeight ?? weight ?? PRESET_WEIGHT[type],
  );

  if (display === "none") return null;

  const resolvedAlign =
    textAlign === "auto" || textAlign === "justify"
      ? undefined
      : (textAlign ?? align);
  const alignment = resolvedAlign ? ALIGN[resolvedAlign] : "leading";

  return (
    <EnsureHost matchContents>
      <Text
        testID={testID}
        modifiers={[
          font({
            textStyle: TEXT_STYLE[type],
            size: fontSize ?? TEXT_SIZE[type],
            family: fontFamily ?? themeFamily,
            design: isCode ? "monospaced" : undefined,
          }),
          ...(styleColor === "inherit"
            ? []
            : [
                foregroundStyle(
                  (styleColor as string) ?? (muted ? "secondary" : "primary"),
                ),
              ]),
          multilineTextAlignment(alignment),
          // A tight height truncates mid-word; only a code chip also refuses
          // to give up width, since it must never wrap.
          ...(numberOfLines === 1
            ? []
            : [fixedSize({ horizontal: isCode, vertical: true })]),
          // A `Text` hugs its content: alignment needs a frame to move in.
          ...(alignment === "leading"
            ? []
            : [frame({ maxWidth: FILL, alignment })]),
          ...(letterSpacing == null ? [] : [kerning(letterSpacing)]),
          ...(numberOfLines == null ? [] : [lineLimit(numberOfLines)]),
          ...(onPress == null ? [] : [onTapGesture(onPress as () => void)]),
          ...(isCode
            ? [
                padding({ horizontal: 6, vertical: 2 }),
                background(secondary),
                cornerRadius(6),
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
 * iOS Typography: same props as PanelUI's, rendered as a SwiftUI `Text`.
 *
 * @see https://panelui.dev/docs/components/typography
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/text/
 */
export const Typography = Object.assign(TypographyRoot, {
  Heading: TypographyHeading,
  Paragraph: TypographyParagraph,
  Code: TypographyCode,
});
