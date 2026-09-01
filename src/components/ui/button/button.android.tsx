import {
  Button as ButtonBase,
  FilledIconButton,
  FilledTonalButton,
  FilledTonalIconButton,
  IconButton,
  OutlinedButton,
  OutlinedIconButton,
  Row,
  Shape,
  type ShapeJSXElement,
  TextButton,
} from "@expo/ui/jetpack-compose";
import {
  height,
  testID as testIDModifier,
  weight,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
import type {
  ButtonProps as ButtonRootProps,
  ButtonSize,
  ButtonVariant,
} from "panelui-native/components/button";
import { Children, cloneElement, isValidElement, useId } from "react";
import { type StyleProp, StyleSheet, type ViewStyle } from "react-native";
import { withUniwind } from "uniwind";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { dp, omitUndefined } from "@/utils/utils";
import { EnsureHost } from "../host";
import { Typography } from "../typography";
import { LABEL_SIZES, SPACING } from "./constants";

const VARIANTS = {
  primary: ButtonBase,
  secondary: FilledTonalButton,
  outline: OutlinedButton,
  ghost: TextButton,
  destructive: TextButton,
  social: OutlinedButton,
} as const satisfies Record<ButtonVariant, unknown>;

const ICON_VARIANTS = {
  primary: FilledIconButton,
  secondary: FilledTonalIconButton,
  outline: OutlinedIconButton,
  ghost: IconButton,
  destructive: IconButton,
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

  const radius = dp(flat.borderRadius);

  return {
    fill: !!(flat.flex ?? flat.flexGrow),
    // Compose takes the shape as an element, one radius per corner.
    shape:
      radius == null
        ? undefined
        : ((
            <Shape.RoundedCorner
              cornerRadii={{
                topStart: radius,
                topEnd: radius,
                bottomStart: radius,
                bottomEnd: radius,
              }}
            />
          ) as ShapeJSXElement),
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
  startContent,
  endContent,
  onPress,
  style,
  testID,
  modifiers,
  colors,
  muted,
}: ButtonRootProps) {
  const id = useId();
  const isIconOnly = size === "icon";
  const destructive = useThemeM3Colors("destructive");
  const m3 = useThemeM3Colors();

  const buttonHeight = HEIGHTS[size];
  const box = resolveStyle(style as StyleProp<ViewStyle>);
  const ButtonComponent = isIconOnly
    ? ICON_VARIANTS[variant]
    : VARIANTS[variant];

  // `Children.toArray` marks an element that arrived unkeyed through a prop
  // slot, so re-key every child here instead of warning at each call site.
  const content = Children.toArray([startContent, children, endContent]).map(
    (child, index) =>
      isValidElement(child) ? (
        // biome-ignore lint/suspicious/noArrayIndexKey: slot content has no stable id
        cloneElement(child, { key: `${id}-${index}` })
      ) : (
        <Typography
          // biome-ignore lint/suspicious/noArrayIndexKey: text children have no stable id
          key={`${id}-${index}`}
          type={LABEL_SIZES[size]}
          className="text-inherit"
        >
          {child}
        </Typography>
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
          ...(box.fill ? [weight(1)] : []),
          ...(testID ? [testIDModifier(testID as string)] : []),
          ...(modifiers ?? []),
        ]}
        shape={box.shape}
        {...(isIconOnly ? {} : { contentPadding: box.contentPadding })}
        onClick={onPress as (() => void) | undefined}
        colors={
          variant === "destructive"
            ? {
                contentColor: destructive.primary,
              }
            : {
                contentColor: muted ? m3?.onSurfaceVariant : undefined,
                ...colors,
              }
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

/**
 * Android Button: same props as PanelUI's, rendered as the Jetpack Compose
 * `Button` family — one Material 3 button per variant.
 *
 * @see https://panelui.dev/docs/components/button
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/button/
 */
export const Button = withUniwind(ButtonRoot);
