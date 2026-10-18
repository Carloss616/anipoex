/** Where `value` sits between `min` and `max`, clamped to 0–1. */
export function fractionOf(value: number, min: number, max: number) {
  const span = max - min;
  if (!(span > 0)) return 0;
  return Math.min(Math.max((value - min) / span, 0), 1);
}
