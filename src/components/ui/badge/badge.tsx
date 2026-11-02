import { cn } from "panelui-native/utils/cn";
import type { ReactNode } from "react";
import { SEMANTIC_COLOR, type SemanticColor } from "../colors";
import { Icon, type IconName } from "../icon";

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
  testID?: string;
}

/** A small, non-interactive status marker — a count, a state, or a bare dot. */
export function Badge({
  children,
  color = "secondary",
  icon,
  className,
}: BadgeProps) {
  const dot = children == null && icon == null;
  const semantic = color === "inherit" ? "destructive" : color;
  const semanticCss = SEMANTIC_COLOR[semantic].className;

  // A span: it sits inline in <p> titles, which can't hold the div of a View.
  return (
    <span
      className={cn(
        "items-center justify-center rounded-full align-middle font-medium text-xs",
        semanticCss.fill,
        semanticCss.label,
        dot ? "size-2" : icon ? "size-5" : "min-w-5 px-1.5 py-0.5",
        className,
      )}
    >
      {icon ? <Icon name={icon} size={12} /> : dot ? null : children}
    </span>
  );
}
