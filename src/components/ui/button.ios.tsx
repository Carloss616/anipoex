import type { IconProps } from "@expo/ui";
import { Button as ButtonBase, type ButtonProps } from "@expo/ui/swift-ui";
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  disabled,
  labelStyle,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import type {
  ButtonLabelProps,
  ButtonRootProps,
  ButtonSize,
  ButtonVariant,
} from "heroui-native/button";
import { useThemeColor } from "heroui-native/hooks";
import { Children, isValidElement, type ReactNode } from "react";
import { textOf } from "@/utils/utils";
import { Host, useIsInsideHost } from "./host";
import { Icon } from "./icon";

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

/** SwiftUI's Button takes the icon as a prop, so read it off the children tree. */
function systemImageOf(children: ReactNode): ButtonProps["systemImage"] {
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

function ButtonRoot({
  children,
  variant = "primary",
  size = "md",
  isIconOnly = false,
  isDisabled = false,
  onPress,
  testID,
}: ButtonRootProps) {
  const isInsideHost = useIsInsideHost();
  const danger = useThemeColor("danger");

  const dangerTint =
    variant === "danger" || variant === "danger-soft" ? danger : null;

  const button = (
    <ButtonBase
      label={textOf(children)}
      systemImage={systemImageOf(children)}
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
    />
  );

  return isInsideHost ? button : <Host matchContents>{button}</Host>;
}

function ButtonLabel(_: ButtonLabelProps) {
  return null;
}

/**
 * iOS Button: same props as `heroui-native`'s, rendered as a SwiftUI `Button`.
 *
 * @see https://heroui.com/docs/native/components/button
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/button/
 */
export const Button = Object.assign(ButtonRoot, {
  Label: ButtonLabel,
});
