import type { ProgressProps } from "./progress";

type ProgressSize = NonNullable<ProgressProps["size"]>;

/** The `h-1.5 / h-2 / h-3` of PanelUI's track, in points. */
export const TRACK_HEIGHT = {
  sm: 6,
  md: 8,
  lg: 12,
} as const satisfies Record<ProgressSize, number>;
