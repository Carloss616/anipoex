import { cn } from "panelui-native/utils/cn";
import type { ReactNode } from "react";
import { type StyleProp, View, type ViewStyle } from "react-native";
import { SEMANTIC_COLOR, type SemanticColor } from "../colors";
import { Icon, type IconName } from "../icon";
import { Typography } from "../typography";

export interface BadgeProps {
  /** Label or count. Left out, the badge is a bare dot. */
  children?: ReactNode;
  /**
   * `inherit` takes the platform's own badge colors: M3's `error` pair on
   * Android, and `destructive` (the same red) where there is no native badge.
   */
  color?: SemanticColor | "inherit";
  /**
   * Draws this instead of `children`, in a round badge: for a state that has to
   * fit where a word wouldn't. Build it with `Icon.select`.
   */
  icon?: IconName;
  className?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** A small, non-interactive status marker — a count, a state, or a bare dot. */
export function Badge({
  children,
  color = "secondary",
  icon,
  className,
  style,
  testID,
}: BadgeProps) {
  const dot = children == null && icon == null;
  const semantic = color === "inherit" ? "destructive" : color;

  return (
    <View
      testID={testID}
      style={style}
      className={cn(
        "items-center justify-center rounded-full",
        SEMANTIC_COLOR[semantic].className.fill,
        dot ? "size-2" : icon ? "size-5" : "min-w-5 px-1.5 py-0.5",
        className,
      )}
    >
      {icon ? (
        <Icon
          name={icon}
          size={12}
          className={SEMANTIC_COLOR[semantic].className.label}
        />
      ) : dot ? null : (
        <Typography
          type="body-xs"
          weight="medium"
          className={cn(
            "leading-[normal]",
            SEMANTIC_COLOR[semantic].className.label,
          )}
        >
          {children}
        </Typography>
      )}
    </View>
  );
}
