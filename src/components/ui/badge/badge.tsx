import { cn } from "heroui-native/utils";
import type { ReactNode } from "react";
import { type StyleProp, View, type ViewStyle } from "react-native";
import { Typography } from "../typography";

export type BadgeColor =
  | "accent"
  | "default"
  | "success"
  | "warning"
  | "danger";

export interface BadgeProps {
  /** Label or count. Left out, the badge is a bare dot. */
  children?: ReactNode;
  color?: BadgeColor;
  className?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const CONTAINER = {
  accent: "bg-primary",
  default: "bg-secondary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
} as const satisfies Record<BadgeColor, string>;

/* The status tokens' `-foreground` is the status *as text*; the readable color
   on a solid fill is `-solid-foreground`. */
const LABEL = {
  accent: "text-primary-foreground",
  default: "text-secondary-foreground",
  success: "text-success-solid-foreground",
  warning: "text-warning-solid-foreground",
  danger: "text-destructive-solid-foreground",
} as const satisfies Record<BadgeColor, string>;

/** A small, non-interactive status marker — a count, a state, or a bare dot. */
export function Badge({
  children,
  color = "default",
  className,
  style,
  testID,
}: BadgeProps) {
  const dot = children == null;

  return (
    <View
      testID={testID}
      style={style}
      className={cn(
        "items-center justify-center rounded-full",
        CONTAINER[color],
        dot ? "size-2" : "min-w-5 px-1.5 py-0.5",
        className,
      )}
    >
      {dot ? null : (
        <Typography
          type="body-xs"
          weight="medium"
          className={cn("leading-[normal]", LABEL[color])}
        >
          {children}
        </Typography>
      )}
    </View>
  );
}
