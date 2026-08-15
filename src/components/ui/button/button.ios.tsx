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
import { Children, isValidElement } from "react";
import { type StyleProp, StyleSheet, type ViewStyle } from "react-native";
import { withUniwind } from "uniwind";
import { useThemeColor } from "@/hooks/use-theme-color";
import { dp, omitUndefined, textOf } from "@/utils/utils";
import { EnsureHost } from "../host";
import { Icon } from "../icon";

type ControlSize = Parameters<typeof controlSize>[0];
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

/** Gap between the pieces of a custom label — SwiftUI stacks them by default. */
const SPACING = {
  sm: 4,
  md: 6,
  lg: 8,
  icon: 0,
} as const satisfies Record<ButtonSize, number>;

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
  const destructiveColor = useThemeColor("destructive");

  const box = resolveStyle(style as StyleProp<ViewStyle>);
  const isIconOnly = size === "icon";
  const destructiveTint = variant === "destructive" ? destructiveColor : null;

  const isSimple = isSimpleLabel(children);

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
          ...(destructiveTint ? [tint(destructiveTint)] : []),
        ]}
        onPress={onPress as (() => void) | undefined}
        testID={testID as string | undefined}
        role={variant === "destructive" ? "destructive" : undefined}
      >
        {isSimple ? undefined : (
          <HStack spacing={SPACING[size]} alignment="center" modifiers={box}>
            {children}
          </HStack>
        )}
      </ButtonBase>
    </EnsureHost>
  );
}

/**
 * iOS Button: same props as PanelUI's, rendered as a SwiftUI `Button`.
 *
 * @see https://panelui.dev/docs/components/button
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/button/
 */
export const Button = withUniwind(ButtonRoot);
