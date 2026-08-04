import { Button } from "@expo/ui/swift-ui";
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  disabled,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { useThemeColor } from "heroui-native/hooks";
import { textOf } from "@/utils/utils";
import type { ChipLabelProps, ChipProps, ChipSize, ChipVariant } from "./chip";
import { Host, useIsInsideHost } from "./host";

type ControlSize = Parameters<typeof controlSize>[0];
type ButtonStyle = Parameters<typeof buttonStyle>[0];

const SIZES = {
  sm: "mini",
  md: "small",
  lg: "regular",
} as const satisfies Record<ChipSize, ControlSize>;

const VARIANTS = {
  primary: "glassProminent",
  secondary: "glass",
  tertiary: "borderless",
  soft: "glass",
} as const satisfies Record<ChipVariant, ButtonStyle>;

const SELECTED_VARIANTS = {
  primary: "glassProminent",
  secondary: "glassProminent",
  tertiary: "glass",
  soft: "glassProminent",
} as const satisfies Record<ChipVariant, ButtonStyle>;

/**
 * iOS Chip: same props as `heroui-native`'s, rendered as a capsule SwiftUI
 * `Button` — iOS has no chip of its own.
 *
 * @see https://heroui.com/docs/native/components/chip
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/button/
 */
export function Chip({
  children,
  size = "sm",
  variant = "primary",
  color = "accent",
  selected = false,
  disabled: isDisabled = false,
  onPress,
  testID,
}: ChipProps) {
  const tintColor = useThemeColor(color === "default" ? "accent" : color);
  const isInsideHost = useIsInsideHost();

  const button = (
    <Button
      label={textOf(children)}
      onPress={onPress as (() => void) | undefined}
      modifiers={[
        buttonStyle(selected ? SELECTED_VARIANTS[variant] : VARIANTS[variant]),
        buttonBorderShape("capsule"),
        controlSize(SIZES[size]),
        disabled(!!isDisabled),
        tint(tintColor),
      ]}
      testID={testID as string | undefined}
      role={color === "danger" ? "destructive" : undefined}
    />
  );

  return isInsideHost ? button : <Host matchContents>{button}</Host>;
}

function ChipLabel(_: ChipLabelProps) {
  return null;
}

Chip.Label = ChipLabel;
