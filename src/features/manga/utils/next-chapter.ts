import { type Chapter, isRead } from "./to-chapters";

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

/**
 * The chapter Continue opens: the lowest unread number, the first listed on a tie.
 * Unnumbered rows only start a manga with no progress, from the oldest row.
 */
export function continueChapter(
  chapters: Chapter[],
  progress: number,
): Chapter | undefined {
  let next: Chapter | undefined;
  for (const chapter of chapters)
    if (
      chapter.number >= 0 &&
      !isRead(progress, chapter.number) &&
      (!next || chapter.number < next.number)
    )
      next = chapter;
  return next ?? (progress === 0 ? chapters.at(-1) : undefined);
}
