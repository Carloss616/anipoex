/** Zero slope at both ends, so a ramp neither cuts in nor steps off. */
export const smootherstep = (p: number) =>
  6 * p ** 5 - 15 * p ** 4 + 10 * p ** 3;

/** Zero slope at the clear end only. */
export const easeIn = (p: number) => p * p;

export interface RampOptions {
  /**
   * Alpha at the far end.
   * @default 0.6
   */
  peak?: number;
  /**
   * How many colors the curve is sampled at.
   * @default 6
   */
  stops?: number;
  /**
   * Alpha as a function of distance along the ramp.
   * @default easeIn
   */
  ease?: (p: number) => number;
  /** Start at `peak` and clear downward, for a ramp that floors the top of a frame. */
  flip?: boolean;
}

/**
 * Color stops for a gradient that fades without banding, top to bottom.
 * Defaults to a wash; one that has to *arrive* at its color wants `peak: 1`
 * and `smootherstep`.
 *
 * The clear end is `color` at alpha 0, never `transparent` — that is
 * transparent *black*, and both platforms interpolate unpremultiplied, so a
 * ramp to a light color grays out on the way.
 */
export function ramp(
  color: string,
  { peak = 0.6, stops = 6, ease = easeIn, flip = false }: RampOptions = {},
) {
  const rgb = color.slice(0, 7); // Compose hands colors back as `#rrggbbaa`.
  const locations = Array.from({ length: stops }, (_, i) => i / (stops - 1));
  const colors = locations.map(
    (p) =>
      rgb +
      Math.round(ease(p) * peak * 255)
        .toString(16)
        .padStart(2, "0"),
  );

  // `locations` stays ascending either way — LinearGradient requires it — so a
  // flip reverses which end carries the alpha, not the direction of travel.
  // A non-empty tuple for LinearGradient, mutable for SwiftUI's foregroundStyle.
  return {
    colors: flip ? colors.toReversed() : colors,
    locations,
  } as unknown as {
    colors: [string, string, ...string[]];
    locations: [number, number, ...number[]];
  };
}
