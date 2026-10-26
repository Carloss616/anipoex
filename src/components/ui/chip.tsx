import {
  type ChipProps,
  Chip as PanelChip,
} from "panelui-native/components/chip";
import { cn } from "panelui-native/utils/cn";

export * from "panelui-native/components/chip";

const HOVER_VARIANTS = {
  default: "hover:bg-surface-tertiary/90 active:bg-accent",
  primary: "hover:bg-primary/90 active:bg-primary",
  outline: "hover:bg-secondary/90 active:bg-accent",
  info: "hover:bg-info/25 active:bg-info/30",
  success: "hover:bg-success/25 active:bg-success/30",
  warning: "hover:bg-warning/25 active:bg-warning/30",
  destructive: "hover:bg-destructive/25 active:bg-destructive/30",
} satisfies Record<NonNullable<ChipProps["variant"]>, string>;

function ChipRoot({ className, ...props }: ChipProps) {
  const variant = props.variant ?? "default";
  return (
    <PanelChip
      data-variant={variant}
      {...props}
      className={cn(
        "transition-colors",
        props.onPress && HOVER_VARIANTS[variant],
        className,
      )}
    />
  );
}

/** PanelUI's Chip with hover on web when pressable; `data-variant` sets its ring color. */
export const Chip = Object.assign(ChipRoot, { Label: PanelChip.Label });
