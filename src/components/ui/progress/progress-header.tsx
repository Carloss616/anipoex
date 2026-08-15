import { Spacer } from "@expo/ui";
import type { ReactNode } from "react";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { Typography } from "../typography";
import type { ProgressProps } from "./progress";

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

function formatValue(
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
 * The caption row above the track. Plain RN on every platform — only the track
 * itself is drawn by the OS, so this stays identical to PanelUI's own.
 */
export function ProgressHeader({
  fraction,
  track,
  value = 0,
  indeterminate = false,
  label,
  showValueLabel = false,
  valueLabel,
  formatOptions,
  headerClassName,
}: ProgressProps & { fraction: number; track: ReactNode }) {
  const showValue = showValueLabel && !indeterminate;
  if (label == null && !showValue) return track;

  return (
    <Column className="w-full gap-2">
      <Row alignment="center" className={headerClassName}>
        {label && (
          <Typography type="body-sm" weight="medium" numberOfLines={1}>
            {label}
          </Typography>
        )}
        <Spacer flexible />
        {showValue && (
          <Typography type="body-sm" muted>
            {formatValue(value, fraction, valueLabel, formatOptions)}
          </Typography>
        )}
      </Row>
      {track}
    </Column>
  );
}
