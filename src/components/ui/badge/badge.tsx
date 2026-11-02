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
  /**
   * Web: a status badge with text is a tint of its color, read on a row. Keep
   * the solid fill where it sits on an image, like a count over a cover.
   */
  solid?: boolean;
  className?: string;
  testID?: string;
}

/** The theme's badge tints (`-subtle`) and the darker text that reads on them. */
const TINT: Partial<Record<SemanticColor, string>> = {
  success: "bg-success-subtle text-success-foreground",
  info: "bg-info-subtle text-info-foreground",
  warning: "bg-warning-subtle text-warning-foreground",
  destructive: "bg-destructive-subtle text-destructive-foreground",
};

/** A small, non-interactive status marker — a count, a state, or a bare dot. */
export function Badge({
  children,
  color = "secondary",
  icon,
  solid,
  className,
}: BadgeProps) {
  const dot = children == null && icon == null;
  const semantic = color === "inherit" ? "destructive" : color;
  const semanticCss = SEMANTIC_COLOR[semantic].className;
  // A dot or a glyph at 8% would vanish: only text badges take the tint.
  const tint = !solid && !dot && !icon ? TINT[semantic] : undefined;

  // A span: it sits inline in <p> titles, which can't hold the div of a View.
  return (
    <span
      className={cn(
        "items-center justify-center rounded-full align-middle font-medium text-xs",
        tint ?? [semanticCss.fill, semanticCss.label],
        dot ? "size-2" : icon ? "size-5" : "min-w-5 px-1.5 py-0.5",
        className,
      )}
    >
      {icon ? <Icon name={icon} size={12} /> : dot ? null : children}
    </span>
  );
}
