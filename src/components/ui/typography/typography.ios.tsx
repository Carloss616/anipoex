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
} from "panelui-native/components/typography";
import { StyleSheet } from "react-native";
import { withUniwind } from "uniwind";
import { useFontFamily } from "@/hooks/use-font";
import { useThemeColor } from "@/hooks/use-theme-color";
import { dp, textOf } from "@/utils/utils";
import { EnsureHost } from "../host";
import { TYPOGRAPHY_IOS, WEIGHT } from "./constants";

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
  modifiers,
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
  const resolvedAlign =
    textAlign === "auto" || textAlign === "justify"
      ? undefined
      : (textAlign ?? align);
  const alignment = resolvedAlign ? ALIGN[resolvedAlign] : "leading";
  const pt = dp(paddingTop);
  const pb = dp(paddingBottom);
  const pl = dp(paddingLeft);
  const pr = dp(paddingRight);
  const py = dp(paddingVertical) ?? (isCode ? 2 : undefined);
  const px = dp(paddingHorizontal) ?? (isCode ? 6 : undefined);
  const p = dp(paddingSize);

  return (
    <EnsureHost matchContents>
      <Text
        testID={testID}
        modifiers={[
          font({
            textStyle: TYPOGRAPHY_IOS[type].textStyle,
            size: fontSize ?? TYPOGRAPHY_IOS[type].size,
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
            : [frame({ maxWidth: Infinity, alignment })]),
          ...(letterSpacing == null ? [] : [kerning(letterSpacing)]),
          ...(numberOfLines == null ? [] : [lineLimit(numberOfLines)]),
          ...(onPress == null ? [] : [onTapGesture(onPress as () => void)]),
          ...(pl || pt || pr || pb || px || py || p
            ? [
                padding({
                  top: pt,
                  bottom: pb,
                  leading: pl,
                  trailing: pr,
                  horizontal: px,
                  vertical: py,
                  all: p,
                }),
              ]
            : []),
          ...(isCode ? [background(secondary), cornerRadius(6)] : []),
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
