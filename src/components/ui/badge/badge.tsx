import { cn } from "panelui-native/utils/cn";
import type { ReactNode } from "react";
import { type StyleProp, View, type ViewStyle } from "react-native";
import { SEMANTIC_COLOR, type SemanticColor } from "../colors";
import { Typography } from "../typography";

export interface BadgeProps {
  /** Label or count. Left out, the badge is a bare dot. */
  children?: ReactNode;
  color?: SemanticColor;
  className?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** A small, non-interactive status marker — a count, a state, or a bare dot. */
export function Badge({
  children,
  color = "secondary",
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
        SEMANTIC_COLOR[color].className.fill,
        dot ? "size-2" : "min-w-5 px-1.5 py-0.5",
        className,
      )}
    >
      {dot ? null : (
        <Typography
          type="body-xs"
          weight="medium"
          className={cn(
            "leading-[normal]",
            SEMANTIC_COLOR[color].className.label,
          )}
        >
          {children}
        </Typography>
      )}
    </View>
  );
}
