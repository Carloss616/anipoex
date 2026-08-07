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
  ButtonContextValue,
  ButtonLabelProps,
  ButtonRootProps,
  ButtonSize,
  ButtonVariant,
} from "heroui-native/button";
import { useThemeColor } from "heroui-native/hooks";
import { cn } from "heroui-native/utils";
import { Children, createContext, isValidElement, useContext } from "react";
import { type StyleProp, StyleSheet, type ViewStyle } from "react-native";
import { withUniwind } from "uniwind";
import { dp, omitUndefined, textOf } from "@/utils/utils";
import { Host, useIsInsideHost } from "./host";
import { Icon } from "./icon";
import { Typography, type TypographyParagraphProps } from "./typography";

type ControlSize = Parameters<typeof controlSize>[0];
type ButtonStyle = Parameters<typeof buttonStyle>[0];

const VARIANTS = {
  primary: "glassProminent",
  secondary: "glass",
  tertiary: "glass",
  outline: "glass",
  ghost: "borderless",
  danger: "glassProminent",
  "danger-soft": "glass",
} as const satisfies Record<ButtonVariant, ButtonStyle>;

const SIZES = {
  sm: "small",
  md: "regular",
  lg: "large",
} as const satisfies Record<ButtonSize, ControlSize>;

const LABEL_SIZES = {
  sm: "body-xs",
  md: "body-sm",
  lg: "body",
} as const satisfies Record<ButtonSize, TypographyParagraphProps["type"]>;

/** Gap between the pieces of a custom label — SwiftUI stacks them by default. */
const SPACING = {
  sm: 4,
  md: 6,
  lg: 8,
} as const satisfies Record<ButtonSize, number>;

function isSimpleLabel(children: React.ReactNode): boolean {
  return Children.toArray(children).every(
    (child) =>
      !isValidElement(child) ||
      child.type === Icon ||
      child.type === ButtonLabel,
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

const ButtonContext = createContext<ButtonContextValue | null>(null);

export function useButton() {
  const context = useContext(ButtonContext);
  if (!context) {
    throw new Error("useButton must be used within a Button");
  }
  return context;
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
  isIconOnly = false,
  isDisabled = false,
  onPress,
  testID,
  style,
}: ButtonRootProps) {
  const isInsideHost = useIsInsideHost();
  const danger = useThemeColor("danger");

  const box = resolveStyle(style as StyleProp<ViewStyle>);
  const dangerTint =
    variant === "danger" || variant === "danger-soft" ? danger : null;

  const isSimple = isSimpleLabel(children);

  const button = (
    <ButtonBase
      label={isSimple ? textOf(children) : undefined}
      systemImage={isSimple ? systemImageOf(children) : undefined}
      modifiers={[
        buttonStyle(VARIANTS[variant]),
        controlSize(SIZES[size]),
        labelStyle(isIconOnly ? "iconOnly" : "automatic"),
        buttonBorderShape(isIconOnly ? "circle" : "automatic"),
        disabled(!!isDisabled),
        ...(dangerTint ? [tint(dangerTint)] : []),
      ]}
      onPress={onPress as (() => void) | undefined}
      testID={testID as string | undefined}
      role={
        variant === "danger" || variant === "danger-soft"
          ? "destructive"
          : undefined
      }
    >
      {isSimple ? undefined : (
        <HStack spacing={SPACING[size]} alignment="center" modifiers={box}>
          {children}
        </HStack>
      )}
    </ButtonBase>
  );

  return (
    <ButtonContext.Provider
      value={{
        size,
        variant,
        isDisabled,
      }}
    >
      {isInsideHost ? button : <Host matchContents>{button}</Host>}
    </ButtonContext.Provider>
  );
}

/**
 * Only reached inside a custom label view — a simple button reads its text off
 * the tree and hands it to SwiftUI as the `label` prop instead. Unstyled on
 * purpose, so the text picks up the button's own tint and control size.
 */
function ButtonLabel({ children, className, ...props }: ButtonLabelProps) {
  const { size } = useButton();

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
 * iOS Button: same props as `heroui-native`'s, rendered as a SwiftUI `Button`.
 *
 * @see https://heroui.com/docs/native/components/button
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/button/
 */
export const Button = Object.assign(withUniwind(ButtonRoot), {
  Label: ButtonLabel,
});
