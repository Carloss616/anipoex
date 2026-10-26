import {
  type ButtonSize,
  type ButtonVariant,
  Button as PanelButton,
  type ButtonProps as PanelButtonProps,
  useButtonGroup,
} from "panelui-native/components/button";
import { cn } from "panelui-native/utils/cn";
import type { RefAttributes } from "react";
import type { View } from "react-native";

export * from "panelui-native/components/button";

/** An icon-only button has no text to read, so it must carry a label. */
export type ButtonProps = PanelButtonProps &
  RefAttributes<View> &
  (
    | { size: "icon"; accessibilityLabel: string }
    | { size?: Exclude<ButtonSize, "icon"> }
  );

const SECONDARY_HOVER = "hover:bg-secondary/90 active:bg-accent";

const HOVER_VARIANTS = {
  primary: "hover:bg-primary/90 active:bg-primary",
  secondary: "hover:bg-surface-tertiary/90 active:bg-accent",
  destructive: "hover:bg-destructive/90 active:bg-destructive",
  outline: SECONDARY_HOVER,
  ghost: SECONDARY_HOVER,
  social: SECONDARY_HOVER,
} satisfies Record<ButtonVariant, string>;

/** PanelUI's Button with hover on web; `data-variant` picks its focus ring in global.css. */
export function Button({ className, ...props }: ButtonProps) {
  const variant = props.variant ?? "primary";
  const inGroup = useButtonGroup() !== null;
  return (
    <PanelButton
      data-variant={variant}
      {...props}
      className={cn(
        "transition-colors",
        props.size === "icon" && !inGroup && "rounded-full",
        HOVER_VARIANTS[variant],
        className,
      )}
    />
  );
}
