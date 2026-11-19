import { type RefObject, useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";
import type { LegendListRef } from "@/components/layout/legend-list";
import {
  type ReadingPosition,
  savePosition,
} from "@/features/manga/state/reading-positions";
import type { Chapter } from "@/features/manga/utils/to-chapters";
import { pageAt } from "../utils/page-at";

/** How long the page must stay put before it's saved. */
const SETTLE_MS = 800;

type Pending = { mangaId: number } & Omit<ReadingPosition, "readAt">;

/**
 * Saves the page on screen once scrolling settles, when the reader closes
 * and when the app goes to the background. A finished chapter isn't saved
 * again: that would bring back the position reaching its end removed.
 */
export function useSavePosition({
  mangaId,
  sourceId,
  chapter,
  pages,
  listRef,
  finished,
}: {
  mangaId: number;
  sourceId: string | undefined;
  chapter: Chapter | undefined;
  pages: number;
  listRef: RefObject<LegendListRef | null>;
  finished: (chapterId: string) => boolean;
}) {
  // Read at scroll time; the list is gone by the time an unmount saves.
  const pending = useRef<Pending | undefined>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isFinished = useRef(finished);
  useEffect(() => {
    isFinished.current = finished;
  });

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    const position = pending.current;
    pending.current = undefined;
    if (!position || isFinished.current(position.chapterId)) return;
    const { mangaId: id, ...rest } = position;
    savePosition(id, rest);
  }, []);

  const onScroll = () => {
    const state = listRef.current?.getState();
    if (!state || !sourceId || !chapter || pages === 0) return;
    // shortcut: a zoomed list's scroll is read as unzoomed; the page can be
    // off by one while zoomed in, fine until someone reads zoomed.
    pending.current = {
      mangaId,
      sourceId,
      chapterId: chapter.id,
      number: chapter.number,
      scanlator: chapter.scanlator,
      pages,
      ...pageAt(state.scroll, pages, state.positionAtIndex, state.sizeAtIndex),
    };
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, SETTLE_MS);
  };

  // Another chapter or leaving saves the one being left.
  const chapterId = chapter?.id;
  useEffect(() => flush, [chapterId, flush]);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background") flush();
    });
    return () => sub.remove();
  }, [flush]);

  return onScroll;
}
