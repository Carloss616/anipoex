import {
  Button as ButtonBase,
  FilledIconButton,
  FilledTonalButton,
  FilledTonalIconButton,
  IconButton,
  OutlinedButton,
  OutlinedIconButton,
  Row,
  TextButton,
} from "@expo/ui/jetpack-compose";
import { height, width } from "@expo/ui/jetpack-compose/modifiers";
import type {
  ButtonProps as ButtonRootProps,
  ButtonSize,
  ButtonVariant,
} from "panelui-native/components/button";
import { cn } from "panelui-native/utils/cn";
import { Children, isValidElement, useId } from "react";
import { type StyleProp, StyleSheet, type ViewStyle } from "react-native";
import { withUniwind } from "uniwind";
import { useThemeColor } from "@/hooks/use-theme-color";
import { dp, omitUndefined, textOf } from "@/utils/utils";
import { EnsureHost } from "../host";
import { Typography, type TypographyParagraphProps } from "../typography";
import { LABEL_SIZES, SPACING } from "./constants";

const VARIANTS = {
  primary: ButtonBase,
  secondary: FilledTonalButton,
  outline: OutlinedButton,
  ghost: TextButton,
  destructive: ButtonBase,
  social: OutlinedButton,
} as const satisfies Record<ButtonVariant, unknown>;

const ICON_VARIANTS = {
  primary: FilledIconButton,
  secondary: FilledTonalIconButton,
  outline: OutlinedIconButton,
  ghost: IconButton,
  destructive: FilledIconButton,
  social: OutlinedIconButton,
} as const satisfies Record<ButtonVariant, unknown>;

const HEIGHTS = {
  sm: 40,
  md: 48,
  lg: 56,
  icon: 48,
} as const satisfies Record<ButtonSize, number>;

/**
 * The size preset fixes the button's height; `h-auto` hands it back to the
 * content, and the padding classes become Material's `contentPadding` — a
 * padding modifier would inset the container itself instead of its content.
 */
function resolveStyle(style: StyleProp<ViewStyle>) {
  const flat = StyleSheet.flatten(style) ?? {};

  const all = dp(flat.padding);
  const horizontal = dp(flat.paddingHorizontal) ?? all;
  const vertical = dp(flat.paddingVertical) ?? all;

  const insets = omitUndefined({
    start: dp(flat.paddingLeft ?? flat.paddingStart) ?? horizontal,
    top: dp(flat.paddingTop) ?? vertical,
    end: dp(flat.paddingRight ?? flat.paddingEnd) ?? horizontal,
    bottom: dp(flat.paddingBottom) ?? vertical,
  });

  return {
    hugs: flat.height === "auto",
    height: dp(flat.height),
    width: dp(flat.width),
    contentPadding: Object.keys(insets).length ? insets : undefined,
  };
}

function ButtonRoot({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onPress,
  style,
}: ButtonRootProps) {
  const id = useId();
  const isIconOnly = size === "icon";
  const [destructive, destructiveSolidForeground] = useThemeColor([
    "destructive",
    // On a solid fill it is `-solid-foreground`; plain `-foreground` is the
    // status as text, which is what belongs on the soft fill.
    "destructive-solid-foreground",
  ]);

  const buttonHeight = HEIGHTS[size];
  const box = resolveStyle(style as StyleProp<ViewStyle>);
  const ButtonComponent = isIconOnly
    ? ICON_VARIANTS[variant]
    : VARIANTS[variant];

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
      <ButtonComponent
        enabled={!disabled && !loading}
        modifiers={[
          ...(box.hugs ? [] : [height(box.height ?? buttonHeight)]),
          ...(isIconOnly || box.width !== undefined
            ? [width(box.width ?? buttonHeight)]
            : []),
        ]}
        {...(isIconOnly ? {} : { contentPadding: box.contentPadding })}
        onClick={onPress as (() => void) | undefined}
        colors={
          variant === "destructive"
            ? {
                containerColor: destructive,
                contentColor: destructiveSolidForeground,
              }
            : undefined
        }
      >
        {isIconOnly ? (
          content
        ) : (
          <Row
            horizontalArrangement={{ spacedBy: SPACING[size] }}
            horizontalAlignment="center"
            verticalAlignment="center"
          >
            {content}
          </Row>
        )}
      </ButtonComponent>
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
 * Android Button: same props as PanelUI's, rendered as the Jetpack Compose
 * `Button` family — one Material 3 button per variant.
 *
 * @see https://panelui.dev/docs/components/button
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/button/
 */
export const Button = withUniwind(ButtonRoot);
