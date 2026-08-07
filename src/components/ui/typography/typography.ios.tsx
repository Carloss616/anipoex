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
import { useFontFamily } from "@/hooks/use-font";
import { textOf } from "@/utils/utils";
import { EnsureHost } from "../host";

type FontParams = Parameters<typeof font>[0];

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

/** Preset point sizes: given a `family`, `font()` falls back to `size ?? 17`. */
const TEXT_SIZE = {
  h1: 34,
  h2: 28,
  h3: 22,
  h4: 20,
  h5: 17,
  h6: 15,
  body: 17,
  "body-sm": 15,
  "body-xs": 13,
  code: 17,
} as const satisfies Record<TypographyType, number>;

/** Each preset's own weight — `headline` is the only one iOS ships semibold. */
const PRESET_WEIGHT = {
  h1: "normal",
  h2: "normal",
  h3: "normal",
  h4: "normal",
  h5: "semibold",
  h6: "normal",
  body: "normal",
  "body-sm": "normal",
  "body-xs": "normal",
  code: "normal",
} as const satisfies Record<TypographyType, TypographyWeight>;

/** Stands in for `.infinity`, which doesn't survive the props bridge. */
const FILL = 100_000;

/** A `text-*` class lands in the style, where it outranks the `align` prop. */
const STYLE_ALIGN: Record<string, TypographyAlign> = {
  left: "start",
  right: "end",
  center: "center",
  justify: "justify",
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
  const defaultColor = useThemeColor("default");

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

  const alignment = ALIGN[STYLE_ALIGN[textAlign as string] ?? align];
  const lines = numberOfLines ?? (truncate ? 1 : undefined);

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
                  (styleColor as string) ??
                    (color === "muted" ? "secondary" : "primary"),
                ),
              ]),
          multilineTextAlignment(alignment),
          // A tight height truncates mid-word; only a code chip also refuses
          // to give up width, since it must never wrap.
          ...(lines === 1
            ? []
            : [fixedSize({ horizontal: isCode, vertical: true })]),
          // A `Text` hugs its content: alignment needs a frame to move in.
          ...(alignment === "leading"
            ? []
            : [frame({ maxWidth: FILL, alignment })]),
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
