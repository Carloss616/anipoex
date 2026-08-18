import type { IconProps } from "@expo/ui";
import {
  Button as ButtonBase,
  type ButtonProps,
  HStack,
} from "@expo/ui/swift-ui";
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  disabled,
  font,
  frame,
  labelStyle,
  padding,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import type {
  ButtonProps as ButtonRootProps,
  ButtonSize,
  ButtonVariant,
} from "panelui-native/components/button";
import { cn } from "panelui-native/utils/cn";
import { Children, isValidElement, useId } from "react";
import { type StyleProp, StyleSheet, type ViewStyle } from "react-native";
import { withUniwind } from "uniwind";
import { useFontFamily } from "@/hooks/use-font";
import { useThemeColor } from "@/hooks/use-theme-color";
import { dp, omitUndefined, textOf } from "@/utils/utils";
import { EnsureHost } from "../host";
import { Icon } from "../icon";
import { Typography, type TypographyParagraphProps } from "../typography";
import { TEXT_SIZE } from "../typography/constants";
import { LABEL_SIZES, SPACING } from "./constants";

type ControlSize = Parameters<typeof controlSize>[0];
type FontParams = Parameters<typeof font>[0];
type ButtonStyle = Parameters<typeof buttonStyle>[0];

const VARIANTS = {
  primary: "glassProminent",
  secondary: "glass",
  outline: "glass",
  ghost: "borderless",
  destructive: "glassProminent",
  social: "glass",
} as const satisfies Record<ButtonVariant, ButtonStyle>;

const SIZES = {
  sm: "small",
  md: "regular",
  lg: "large",
  icon: "regular",
} as const satisfies Record<ButtonSize, ControlSize>;

const LABEL_STYLES = {
  sm: "footnote",
  md: "subheadline",
  lg: "body",
  icon: "subheadline",
} as const satisfies Record<ButtonSize, FontParams["textStyle"]>;

function isSimpleLabel(children: React.ReactNode): boolean {
  return Children.toArray(children).every(
    (child) => !isValidElement(child) || child.type === Icon,
  );
}

/** SwiftUI's Button takes the icon as a prop, so read it off the children tree. */
function systemImageOf(children: React.ReactNode): ButtonProps["systemImage"] {
  for (const child of Children.toArray(children)) {
    if (!isValidElement<Pick<IconProps, "name">>(child)) continue;
    if (child.type !== Icon) continue;
    if (typeof child.props.name !== "string") {
      throw new Error("ButtonIcon name must be a string");
    }
    return child.props.name as ButtonProps["systemImage"];
  }
  return undefined;
}

/**
 * A SwiftUI button is already sized by its label — `h-auto` is the default, and
 * anything else is a frame. The modifiers go on the label rather than the button
 * so the background grows with them instead of being pushed away from siblings.
 */
function resolveStyle(style: StyleProp<ViewStyle>) {
  const flat = StyleSheet.flatten(style) ?? {};

  const insets = omitUndefined({
    all: dp(flat.padding),
    horizontal: dp(flat.paddingHorizontal),
    vertical: dp(flat.paddingVertical),
    top: dp(flat.paddingTop),
    bottom: dp(flat.paddingBottom),
    leading: dp(flat.paddingLeft ?? flat.paddingStart),
    trailing: dp(flat.paddingRight ?? flat.paddingEnd),
  });
  const box = omitUndefined({
    width: dp(flat.width),
    height: flat.height === "auto" ? undefined : dp(flat.height),
  });

  return [
    ...(Object.keys(insets).length ? [padding(insets)] : []),
    ...(Object.keys(box).length ? [frame(box)] : []),
  ];
}

function ButtonRoot({
  children,
  variant = "primary",
  size = "md",
  disabled: isDisabled = false,
  loading = false,
  onPress,
  testID,
  style,
}: ButtonRootProps) {
  const id = useId();
  const destructiveColor = useThemeColor("destructive");
  const themeFamily = useFontFamily("medium");

  const box = resolveStyle(style as StyleProp<ViewStyle>);
  const isIconOnly = size === "icon";
  const destructiveTint = variant === "destructive" ? destructiveColor : null;

  const isSimple = isSimpleLabel(children);
  // A bare string child is the documented shorthand for <Button.Label>.
  const content = Children.toArray(children).map((child, index) =>
    isValidElement(child) ? (
      child
    ) : (
      // biome-ignore lint/suspicious/noArrayIndexKey: text children have no stable id
      <ButtonLabel key={`${id}-${index}`} size={size}>
        {child}
      </ButtonLabel>
    ),
  );

  return (
    <EnsureHost matchContents>
      <ButtonBase
        label={isSimple ? textOf(children) : undefined}
        systemImage={isSimple ? systemImageOf(children) : undefined}
        modifiers={[
          buttonStyle(VARIANTS[variant]),
          controlSize(SIZES[size]),
          labelStyle(isIconOnly ? "iconOnly" : "automatic"),
          buttonBorderShape(isIconOnly ? "circle" : "automatic"),
          disabled(isDisabled || loading),
          ...(isIconOnly
            ? []
            : [
                font({
                  size: TEXT_SIZE[LABEL_SIZES[size]],
                  textStyle: LABEL_STYLES[size],
                  family: themeFamily,
                }),
              ]),
          ...(destructiveTint ? [tint(destructiveTint)] : []),
        ]}
        onPress={onPress as (() => void) | undefined}
        testID={testID as string | undefined}
        role={variant === "destructive" ? "destructive" : undefined}
      >
        {isSimple ? undefined : (
          <HStack spacing={SPACING[size]} alignment="center" modifiers={box}>
            {content}
          </HStack>
        )}
      </ButtonBase>
    </EnsureHost>
  );
}

function ButtonLabel({
  children,
  className,
  size,
  ...props
}: TypographyParagraphProps & { size: ButtonSize }) {
  return (
    <Typography
      type={LABEL_SIZES[size]}
      className={cn("text-inherit", className)}
      {...props}
    >
      {textOf(children)}
    </Typography>
  );
}

/**
 * iOS Button: same props as PanelUI's, rendered as a SwiftUI `Button`.
 *
 * @see https://panelui.dev/docs/components/button
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/button/
 */
export const Button = withUniwind(ButtonRoot);
