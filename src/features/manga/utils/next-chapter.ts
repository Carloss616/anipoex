import type { Chapter } from "./to-chapters";

/** The chapter after `current`; sources list newest first, so an unnumbered row's next is the row above. */
export function nextChapter(
  chapters: Chapter[],
  current: Chapter,
): Chapter | undefined {
  if (current.number < 0) {
    return chapters[chapters.indexOf(current) - 1];
  }
  const higher = chapters.filter((c) => c.number > current.number);
  if (higher.length === 0) return undefined;
  const lowest = Math.min(...higher.map((c) => c.number));
  const ties = higher.filter((c) => c.number === lowest);
  const sameGroup =
    current.scanlator !== null &&
    ties.find((c) => c.scanlator === current.scanlator);
  return sameGroup || ties[0];
}
