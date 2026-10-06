import type { UseBreakpointResult } from "panelui-native/hooks/use-breakpoint";

export const COLUMNS = {
  base: 4,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
} as const satisfies Record<UseBreakpointResult["current"], number>;

/** Splits `items` into rows of `columns`; the lazy stacks have no grid. */
export function toRows<T>(items: readonly T[], columns: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns));
  }
  return rows;
}

/** Width of one of `columns` cards that, with their gaps, fill `width`. */
export function cellWidth(width: number, columns: number, gap: number) {
  return Math.max(0, (width - gap * (columns - 1)) / columns);
}
