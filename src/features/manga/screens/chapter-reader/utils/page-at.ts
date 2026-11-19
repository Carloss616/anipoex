/** The page under the list's top edge, from 1, and how far down it (0–0.99). */
export function pageAt(
  scroll: number,
  count: number,
  positionAt: (index: number) => number,
  sizeAt: (index: number) => number,
) {
  let index = 0;
  while (index < count - 1 && positionAt(index) + sizeAt(index) <= scroll)
    index++;
  const size = sizeAt(index);
  const into = size > 0 ? (scroll - positionAt(index)) / size : 0;
  return {
    page: index + 1,
    offset: Math.round(Math.min(Math.max(into, 0), 0.99) * 100) / 100,
  };
}
