import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersist } from "@/state/observable-persist";
import { mediaKey } from "../utils/msu";

/** Where the user is in the chapter they're reading of a manga. */
export interface ReadingPosition {
  sourceId: string;
  /** The chapter's url in that source. */
  chapterId: string;
  number: number;
  scanlator: string | null;
  /** The first page on screen, from 1. */
  page: number;
  pages: number;
  /** How far down that page, 0–1. */
  offset: number;
  readAt: number;
}

/** Per manga, the chapter being read; removed once it's read, so no history. */
export const readingPositions$ = observable<Record<string, ReadingPosition>>(
  {},
);

syncObservable(readingPositions$, {
  persist: { name: "reading-positions", plugin: ObservablePersist },
});

export function savePosition(
  mangaId: number,
  position: Omit<ReadingPosition, "readAt">,
) {
  const entry$ = readingPositions$[mediaKey(mangaId)];
  const current = entry$.peek();
  if (
    current?.chapterId === position.chapterId &&
    current.sourceId === position.sourceId &&
    current.page === position.page &&
    current.pages === position.pages &&
    current.offset === position.offset
  )
    return;
  entry$.set({ ...position, readAt: Date.now() });
}

/** Removes it if it is for `chapterId` (or any); returns what it removed. */
export function dropPosition(mangaId: number, chapterId?: string) {
  const entry$ = readingPositions$[mediaKey(mangaId)];
  const current = entry$.peek();
  if (!current || (chapterId !== undefined && current.chapterId !== chapterId))
    return undefined;
  entry$.delete();
  return current;
}

export const restorePosition = (mangaId: number, position: ReadingPosition) =>
  readingPositions$[mediaKey(mangaId)].set(position);

/**
 * Where a chapter opens: its saved page and offset when the position is this
 * very chapter in this source, past the top.
 */
export function startAt(mangaId: number, sourceId: string, chapterId: string) {
  const saved = readingPositions$[mediaKey(mangaId)].peek();
  return saved?.sourceId === sourceId &&
    saved.chapterId === chapterId &&
    (saved.page > 1 || saved.offset > 0)
    ? { page: saved.page, offset: saved.offset }
    : undefined;
}
