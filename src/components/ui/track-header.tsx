import { Spacer } from "@expo/ui";
import type { ReactNode } from "react";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import type { ProgressProps } from "./progress/progress";
import { Typography } from "./typography";

type ProgressSize = NonNullable<ProgressProps["size"]>;

/** The `h-1.5 / h-2 / h-3` of PanelUI's track, in points. */
export const TRACK_HEIGHT = {
  sm: 6,
  md: 8,
  lg: 12,
} as const satisfies Record<ProgressSize, number>;

export function fractionOf(value: number, min: number, max: number) {
  const span = max - min;
  if (!(span > 0)) return 0;
  return Math.min(Math.max((value - min) / span, 0), 1);
}

/** Progress' value label: an override, an `Intl` format, or a bare percent. */
export function formatProgressValue(
  value: number,
  fraction: number,
  valueLabel?: string,
  formatOptions?: Intl.NumberFormatOptions,
) {
  if (valueLabel != null) return valueLabel;
  if (formatOptions) {
    try {
      return new Intl.NumberFormat(undefined, formatOptions).format(
        formatOptions.style === "percent" ? fraction : value,
      );
    } catch {
      // Some engines ship a partial Intl; fall through to the plain percent.
    }
  }
  return `${Math.round(fraction * 100)}%`;
}

/**
 * The caption row above a track — the label on the left, the value opposite
 * it. Plain RN on every platform: only the track itself is drawn by the OS, so
 * this stays identical to PanelUI's own, for Progress and Slider alike.
 */
export function TrackHeader({
  label,
  valueLabel,
  headerClassName,
  track,
}: {
  label?: string;
  /** Already formatted — the callers each write their value their own way. */
  valueLabel?: string;
  headerClassName?: string;
  track: ReactNode;
}) {
  if (label == null && valueLabel == null) return track;

  return (
    <Column className="gap-2">
      <Row alignment="center" className={headerClassName}>
        {label && (
          <Typography weight="medium" numberOfLines={1}>
            {label}
          </Typography>
        )}
        <Spacer flexible />
        {valueLabel != null && <Typography muted>{valueLabel}</Typography>}
      </Row>
      {track}
    </Column>
  );
}
