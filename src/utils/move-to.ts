/** A new list with `item` at index `to`, clamped to the list. */
export function moveTo<T>(list: readonly T[], item: T, to: number): T[] {
  const rest = list.filter((entry) => entry !== item);
  rest.splice(Math.max(0, Math.min(to, rest.length)), 0, item);
  return rest;
}
