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
  foregroundStyle,
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
import { Children, cloneElement, isValidElement, useId } from "react";
import { type StyleProp, StyleSheet, type ViewStyle } from "react-native";
import { withUniwind } from "uniwind";
import { useFontFamily } from "@/hooks/use-font";
import { useThemeColor } from "@/hooks/use-theme-color";
import { dp, omitUndefined, textOf } from "@/utils/utils";
import { EnsureHost } from "../host";
import { Icon } from "../icon";
import { Typography } from "../typography";
import { TYPOGRAPHY_IOS } from "../typography/constants";
import { LABEL_SIZES, SPACING } from "./constants";

type ControlSize = Parameters<typeof controlSize>[0];
type ButtonStyle = Parameters<typeof buttonStyle>[0];

const VARIANTS = {
  primary: "glassProminent",
  secondary: "glass",
  outline: "glass",
  ghost: "borderless",
  destructive: "automatic",
  social: "glass",
} as const satisfies Record<ButtonVariant, ButtonStyle>;

const SIZES = {
  sm: "small",
  md: "regular",
  lg: "large",
  icon: "regular",
} as const satisfies Record<ButtonSize, ControlSize>;

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
 * so the background grows with them instead of being pushed away from siblings,
 * which is why a `label` of them rules out the plain-string label below.
 * `fill` is the exception: `flex-1` (which uniwind compiles to RN's own `flex`)
 * has to widen the button itself — an HStack splits its width evenly between the
 * children that ask for all of it.
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

  return {
    fill: !!(flat.flex ?? flat.flexGrow),
    radius: dp(flat.borderRadius),
    label: [
      ...(Object.keys(insets).length ? [padding(insets)] : []),
      ...(Object.keys(box).length ? [frame(box)] : []),
    ],
  };
}

function ButtonRoot({
  children,
  variant = "primary",
  size = "md",
  disabled: isDisabled = false,
  loading = false,
  startContent,
  endContent,
  onPress,
  testID,
  style,
  modifiers,
  cancelRole,
  muted,
}: ButtonRootProps) {
  const id = useId();
  const destructiveColor = useThemeColor("destructive");
  const themeFamily = useFontFamily("medium");

  const box = resolveStyle(style as StyleProp<ViewStyle>);
  const isIconOnly = size === "icon";
  const destructiveTint = variant === "destructive" ? destructiveColor : null;

  const items = [startContent, children, endContent];
  // SwiftUI builds the string `label` itself, out of reach of `box.label`.
  const isSimple = !endContent && !box.label.length && isSimpleLabel(items);
  // `Children.toArray` marks an element that arrived unkeyed through a prop
  // slot, so re-key every child here instead of warning at each call site.
  const content = Children.toArray(items).map((child, index) =>
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
      <ButtonBase
        label={isSimple ? textOf(items) : undefined}
        systemImage={isSimple ? systemImageOf(items) : undefined}
        modifiers={[
          buttonStyle(cancelRole ? "automatic" : VARIANTS[variant]),
          controlSize(SIZES[size]),
          labelStyle(isIconOnly ? "iconOnly" : "automatic"),
          isIconOnly
            ? buttonBorderShape("circle")
            : buttonBorderShape(
                box.radius == null ? "automatic" : "roundedRectangle",
                box.radius,
              ),
          disabled(isDisabled || loading),
          ...(isIconOnly
            ? []
            : [
                font({
                  ...TYPOGRAPHY_IOS[LABEL_SIZES[size]],
                  family: themeFamily,
                }),
              ]),
          ...(destructiveTint ? [tint(destructiveTint)] : []),
          ...(muted || cancelRole ? [foregroundStyle("secondary")] : []),
          ...(box.fill ? [frame({ maxWidth: Infinity })] : []),
          ...(modifiers ?? []),
        ]}
        onPress={onPress as (() => void) | undefined}
        testID={testID as string | undefined}
        role={
          variant === "destructive"
            ? "destructive"
            : cancelRole
              ? "cancel"
              : undefined
        }
      >
        {isSimple ? undefined : (
          <HStack
            spacing={SPACING[size]}
            alignment="center"
            modifiers={box.label}
          >
            {content}
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
