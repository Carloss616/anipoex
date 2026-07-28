import { Button, Host } from "@expo/ui/swift-ui";
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  disabled as disabledModifier,
} from "@expo/ui/swift-ui/modifiers";
import type {
  ChipLabelProps,
  ChipProps,
  ChipSize,
  ChipVariant,
} from "heroui-native/chip";
import { useThemeColor } from "heroui-native/hooks";
import { Uniwind } from "uniwind";
import { textOf } from "@/utils/utils";

type ControlSize = Parameters<typeof controlSize>[0];
type ButtonStyle = Parameters<typeof buttonStyle>[0];

const SIZES = {
  sm: "small",
  md: "regular",
  lg: "large",
} as const satisfies Record<ChipSize, ControlSize>;

const STYLES = {
  primary: "glassProminent",
  secondary: "glass",
  tertiary: "borderless",
  soft: "bordered",
} as const satisfies Record<ChipVariant, ButtonStyle>;

function useColors(
  color: ChipProps["color"] = "default",
  variant: ChipProps["variant"] = "secondary",
) {
  const tintColor = useThemeColor(color);

  if (color === "default") {
    if (variant === "secondary") return undefined;
    if (variant === "tertiary" || variant === "soft")
      return Uniwind.getCSSVariable("--color-foreground") as string;
  }
  return tintColor;
}

export function Chip({
  children,
  size = "sm",
  variant = "primary",
  color = "accent",
  disabled,
  onPress,
}: ChipProps) {
  const seedColor = useColors(color, variant);

  return (
    <Host seedColor={seedColor} matchContents>
      <Button
        label={textOf(children)}
        onPress={onPress as (() => void) | undefined}
        modifiers={[
          buttonStyle(STYLES[variant]),
          buttonBorderShape("capsule"),
          controlSize(SIZES[size]),
          // tint(tintColor),
          disabledModifier(!!disabled),
        ]}
      />
    </Host>
  );
}

function ChipLabel(_props: ChipLabelProps) {
  return null;
}

Chip.Label = ChipLabel;
