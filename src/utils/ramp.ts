/** Zero slope at both ends, so a ramp neither cuts in nor steps off. */
export const smootherstep = (p: number) =>
  6 * p ** 5 - 15 * p ** 4 + 10 * p ** 3;

/** Zero slope at the clear end only. */
export const easeIn = (p: number) => p * p;

export interface RampOptions {
  /** Alpha at the far end. */
  peak?: number;
  /** How many colours the curve is sampled at. */
  stops?: number;
  /** Alpha as a function of distance along the ramp. */
  ease?: (p: number) => number;
}

/**
 * Colour stops for a gradient that fades without banding, top to bottom.
 * Defaults to a wash; one that has to *arrive* at its colour wants `peak: 1`
 * and `smootherstep`.
 *
 * The clear end is `color` at alpha 0, never `transparent` — that is
 * transparent *black*, and both platforms interpolate unpremultiplied, so a
 * ramp to a light colour greys out on the way.
 */
export function ramp(
  color: string,
  { peak = 0.6, stops = 6, ease = easeIn }: RampOptions = {},
) {
  const rgb = color.slice(0, 7); // Compose hands colours back as `#rrggbbaa`.
  const locations = Array.from({ length: stops }, (_, i) => i / (stops - 1));
  const colors = locations.map(
    (p) =>
      rgb +
      Math.round(ease(p) * peak * 255)
        .toString(16)
        .padStart(2, "0"),
  );

  // A non-empty tuple for LinearGradient, mutable for SwiftUI's foregroundStyle.
  return { colors, locations } as unknown as {
    colors: [string, string, ...string[]];
    locations: [number, number, ...number[]];
  };
}
