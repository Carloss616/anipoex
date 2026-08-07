import { cn } from "heroui-native/utils";
import type { ReactNode } from "react";
import { type StyleProp, View, type ViewStyle } from "react-native";
import { Typography } from "./typography";

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
  accent: "bg-accent",
  default: "bg-default",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
} as const satisfies Record<BadgeColor, string>;

const LABEL = {
  accent: "text-accent-foreground",
  default: "text-default-foreground",
  success: "text-success-foreground",
  warning: "text-warning-foreground",
  danger: "text-danger-foreground",
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
