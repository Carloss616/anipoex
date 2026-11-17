import { cn } from "panelui-native/utils/cn";
import { BADGE_TINT, SEMANTIC_COLOR, type SemanticColor } from "../colors";
import { Icon, type IconName } from "../icon";

export interface BadgeSegment {
  color: SemanticColor;
  icon?: IconName;
  label: string;
}

export interface SplitBadgeProps {
  /** Joined left to right in one pill; one segment reads as a `Badge`. */
  segments: BadgeSegment[];
  /** What a screen reader says in place of the segments. */
  accessibilityLabel?: string;
  /**
   * A solid fill over a cover; a row takes the tint, as `Badge` does.
   * @platform web
   */
  solid?: boolean;
  className?: string;
}

/** Several counts in one pill, like a library's `downloaded | unread`. */
export function SplitBadge({
  segments,
  accessibilityLabel,
  solid,
  className,
}: SplitBadgeProps) {
  // A span: it sits inline in <p> titles, which can't hold the div of a View.
  return (
    <span
      className={cn(
        "inline-flex overflow-hidden rounded-full align-middle text-xs font-medium",
        className,
      )}
    >
      {segments.map(({ color, icon, label }) => (
        <span
          key={`${color}-${label}`}
          aria-hidden={accessibilityLabel ? true : undefined}
          className={cn(
            "inline-flex min-w-5 items-center justify-center gap-0.5 px-1.5 py-0.5",
            (!solid && BADGE_TINT[color]) || [
              SEMANTIC_COLOR[color].className.fill,
              SEMANTIC_COLOR[color].className.label,
            ],
          )}
        >
          {icon && <Icon name={icon} size={12} />}
          {label}
        </span>
      ))}
      {accessibilityLabel && (
        <span className="sr-only">{accessibilityLabel}</span>
      )}
    </span>
  );
}
