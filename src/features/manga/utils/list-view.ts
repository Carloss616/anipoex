import type { UseBreakpointResult } from "panelui-native/hooks/use-breakpoint";

type Breakpoint = UseBreakpointResult["current"];

/** Default columns per breakpoint; the user's density moves it one either way. */
export const COLUMNS = {
  base: 3,
  sm: 4,
  md: 5,
  lg: 6,
  xl: 7,
} as const satisfies Record<Breakpoint, number>;

const DENSITIES = [-1, 0, 1] as const;
export type Density = (typeof DENSITIES)[number];

/** The most columns the width allows: covers are the point of the grid. */
export const DEFAULT_DENSITY: Density = 1;

/**
 * Persisted as a step, not a count, so a rotation or a resized window keeps the
 * choice relative. Anything off the scale (an older build, a hand edit) is the default.
 */
export function columnsFor(breakpoint: Breakpoint, density: unknown) {
  const step = DENSITIES.find((d) => d === density) ?? DEFAULT_DENSITY;
  return COLUMNS[breakpoint] + step;
}

/** What the column pickers offer at this width, fewest first. */
export function columnOptions(breakpoint: Breakpoint) {
  return DENSITIES.map((density) => ({
    density,
    columns: COLUMNS[breakpoint] + density,
  }));
}

export type TitlePosition = "below" | "over";

export function toTitlePosition(value: unknown): TitlePosition {
  return value === "over" ? "over" : "below";
}
