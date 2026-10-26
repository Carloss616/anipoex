export type Orientation = "horizontal" | "vertical";

const STEP = {
  vertical: { ArrowDown: 1, ArrowUp: -1 },
  horizontal: { ArrowRight: 1, ArrowLeft: -1 },
} as const;

/** The item a key moves to in a group of `count`, wrapping at the ends; null when the key doesn't move. */
export function nextIndex(
  current: number,
  count: number,
  key: string,
  orientation: Orientation,
): number | null {
  if (count === 0) return null;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  const step = (STEP[orientation] as Record<string, number>)[key];
  if (step === undefined) return null;
  return (current + step + count) % count;
}

/** The cell a key moves to in a grid of `columns`; null at its edges, where it doesn't wrap. */
export function nextGridIndex(
  current: number,
  count: number,
  key: string,
  columns: number,
): number | null {
  if (count === 0) return null;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  const step = {
    ArrowRight: 1,
    ArrowLeft: -1,
    ArrowDown: columns,
    ArrowUp: -columns,
  }[key];
  if (step === undefined) return null;
  const next = current + step;
  return next >= 0 && next < count ? next : null;
}
