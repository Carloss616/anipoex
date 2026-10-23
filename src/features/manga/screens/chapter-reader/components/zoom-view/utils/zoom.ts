export const MAX_SCALE = 3;

export const clamp = (value: number, min: number, max: number) => {
  "worklet";
  return Math.min(max, Math.max(min, value));
};

/**
 * The zoom scales the list's viewport from its top-left corner and slides it
 * sideways, so a point at `local` in the viewport shows at
 * `scale × local + translateX` across and `scale × local` down. Down, the list
 * itself scrolls: that keeps its native momentum and reaches both ends.
 */
export interface Zoom {
  scale: number;
  translateX: number;
  /** The list's scroll offset, in its own (unscaled) pixels. */
  scroll: number;
}

/** The point under the pinch: x in the unscaled viewport, y in the list's content. */
export interface PinchAnchor {
  scale: number;
  x: number;
  y: number;
}

export function pinchAnchor(
  { scale, translateX, scroll }: Zoom,
  focalX: number,
  focalY: number,
): PinchAnchor {
  "worklet";
  return {
    scale,
    x: (focalX - translateX) / scale,
    y: scroll + focalY / scale,
  };
}

/** The zoom after a pinch of `factor` from `anchor`, with its point under the fingers at (`focalX`, `focalY`). */
export function pinchTo(
  anchor: PinchAnchor,
  {
    factor,
    focalX,
    focalY,
    width,
    maxScroll,
  }: {
    factor: number;
    focalX: number;
    focalY: number;
    /** The viewport's width. */
    width: number;
    maxScroll: number;
  },
): Zoom {
  "worklet";
  const scale = clamp(anchor.scale * factor, 1, MAX_SCALE);
  return {
    scale,
    translateX: clamp(focalX - scale * anchor.x, (1 - scale) * width, 0),
    scroll: clamp(anchor.y - focalY / scale, 0, maxScroll),
  };
}
