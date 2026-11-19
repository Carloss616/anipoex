import type { ReadingPosition } from "../state/reading-positions";
import { type Chapter, isRead } from "./to-chapters";

/**
 * The position while its chapter is unread. `progress` is null when the
 * manga isn't on the list: then only reaching the last page reads it.
 */
export function livePosition(
  position: ReadingPosition | undefined,
  progress: number | null,
) {
  if (!position) return undefined;
  const read =
    progress === null
      ? position.page >= position.pages
      : isRead(progress, position.number);
  return read ? undefined : position;
}

export interface ResolvedPosition {
  chapter: Chapter;
  page: number;
  offset: number;
}

const exact = (
  position: ReadingPosition,
  sourceId: string | undefined,
  chapterId: string,
) => position.sourceId === sourceId && position.chapterId === chapterId;

/**
 * The saved chapter in the current source's list. Another source or url cuts
 * its pages differently, so only the same chapter keeps the page.
 */
export function resolvePosition(
  position: ReadingPosition | undefined,
  sourceId: string | undefined,
  chapters: Chapter[],
): ResolvedPosition | undefined {
  if (!position) return undefined;
  const same = chapters.find((c) => exact(position, sourceId, c.id));
  if (same)
    return { chapter: same, page: position.page, offset: position.offset };
  if (position.number < 0) return undefined;
  const numbered = chapters.filter((c) => c.number === position.number);
  const chapter =
    numbered.find((c) => c.scanlator === position.scanlator) ?? numbered[0];
  return chapter && { chapter, page: 1, offset: 0 };
}

/** "Page 8 of 40" on the row of the exact saved chapter. */
export const pageLabel = (
  position: ReadingPosition | undefined,
  sourceId: string | undefined,
  chapterId: string,
) =>
  position && exact(position, sourceId, chapterId)
    ? `Page ${position.page} of ${position.pages}`
    : undefined;

/**
 * For a sync: whether a stored position is read by `progress` (as in
 * `livePosition`; undefined when the manga's entry isn't known here).
 */
export const deadPosition = (
  value: unknown,
  progress: number | null | undefined,
) =>
  progress !== undefined &&
  !!value &&
  !livePosition(value as ReadingPosition, progress);
