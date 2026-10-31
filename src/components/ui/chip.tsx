import {
  type ChipProps,
  Chip as PanelChip,
} from "panelui-native/components/chip";
import { cn } from "panelui-native/utils/cn";

export * from "panelui-native/components/chip";

const HOVER_VARIANTS = {
  default: "hover:not-disabled:bg-secondary/80",
  primary: "hover:not-disabled:bg-primary/90",
  outline:
    "hover:not-disabled:bg-accent hover:not-disabled:text-accent-foreground",
  info: "hover:not-disabled:bg-info-soft focus-visible:ring-info/40",
  success: "hover:not-disabled:bg-success-soft focus-visible:ring-success/40",
  warning: "hover:not-disabled:bg-warning-soft focus-visible:ring-warning/40",
  destructive:
    "hover:not-disabled:bg-destructive-soft focus-visible:ring-destructive/40",
} satisfies Record<NonNullable<ChipProps["variant"]>, string>;

function ChipRoot({ className, ...props }: ChipProps) {
  const variant = props.variant ?? "default";
  return (
    <PanelChip
      {...props}
      className={cn(
        "transition-colors",
        "outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        props.onPress && HOVER_VARIANTS[variant],
        className,
      )}
    />
  );
}

/** PanelUI's Chip with hover on web when pressable */
export const Chip = Object.assign(ChipRoot, { Label: PanelChip.Label });
