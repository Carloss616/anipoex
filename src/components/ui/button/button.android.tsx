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
  ButtonContextValue,
  ButtonLabelProps,
  ButtonRootProps,
  ButtonSize,
  ButtonVariant,
} from "heroui-native/button";
import { useThemeColor } from "heroui-native/hooks";
import { cn } from "heroui-native/utils";
import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useId,
} from "react";
import { type StyleProp, StyleSheet, type ViewStyle } from "react-native";
import { withUniwind } from "uniwind";
import { dp, omitUndefined, textOf } from "@/utils/utils";
import { EnsureHost } from "../host";
import { Typography, type TypographyParagraphProps } from "../typography";

const VARIANTS = {
  primary: ButtonBase,
  secondary: FilledTonalButton,
  tertiary: FilledTonalButton,
  outline: OutlinedButton,
  ghost: TextButton,
  danger: ButtonBase,
  "danger-soft": FilledTonalButton,
} as const satisfies Record<ButtonVariant, unknown>;

const ICON_VARIANTS = {
  primary: FilledIconButton,
  secondary: FilledTonalIconButton,
  tertiary: FilledTonalIconButton,
  outline: OutlinedIconButton,
  ghost: IconButton,
  danger: FilledIconButton,
  "danger-soft": FilledTonalIconButton,
} as const satisfies Record<ButtonVariant, unknown>;

const SIZES = {
  sm: { height: 40, spacing: 6 },
  md: { height: 48, spacing: 8 },
  lg: { height: 56, spacing: 10 },
} as const satisfies Record<ButtonSize, { height: number; spacing: number }>;

const LABEL_SIZES = {
  sm: "body-xs",
  md: "body-sm",
  lg: "body",
} as const satisfies Record<ButtonSize, TypographyParagraphProps["type"]>;

const ButtonContext = createContext<ButtonContextValue | null>(null);

export function useButton() {
  const context = useContext(ButtonContext);
  if (!context) {
    throw new Error("useButton must be used within a Button");
  }
  return context;
}

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
  isIconOnly = false,
  isDisabled = false,
  onPress,
  style,
}: ButtonRootProps) {
  const id = useId();
  const [danger, dangerForeground, dangerSoft, dangerSoftForeground] =
    useThemeColor([
      "danger",
      "danger-foreground",
      "danger-soft",
      "danger-soft-foreground",
    ]);

  const { spacing, height: buttonHeight } = SIZES[size];
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
      <ButtonLabel key={`${id}-${index}`}>{child}</ButtonLabel>
    ),
  );

  return (
    <ButtonContext.Provider
      value={{
        size,
        variant,
        isDisabled,
      }}
    >
      <EnsureHost matchContents>
        <ButtonComponent
          enabled={!isDisabled}
          modifiers={[
            ...(box.hugs ? [] : [height(box.height ?? buttonHeight)]),
            ...(isIconOnly || box.width !== undefined
              ? [width(box.width ?? buttonHeight)]
              : []),
          ]}
          {...(isIconOnly ? {} : { contentPadding: box.contentPadding })}
          onClick={onPress as (() => void) | undefined}
          colors={
            variant === "danger"
              ? { containerColor: danger, contentColor: dangerForeground }
              : variant === "danger-soft"
                ? {
                    containerColor: dangerSoft,
                    contentColor: dangerSoftForeground,
                  }
                : undefined
          }
        >
          {isIconOnly ? (
            content
          ) : (
            <Row
              horizontalArrangement={{ spacedBy: spacing }}
              horizontalAlignment="center"
            >
              {content}
            </Row>
          )}
        </ButtonComponent>
      </EnsureHost>
    </ButtonContext.Provider>
  );
}

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
 * Android Button: same props as `heroui-native`'s, rendered as the Jetpack
 * Compose `Button` family — one Material 3 button per variant.
 *
 * @see https://heroui.com/docs/native/components/button
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/button/
 */
export const Button = Object.assign(withUniwind(ButtonRoot), {
  Label: ButtonLabel,
});
