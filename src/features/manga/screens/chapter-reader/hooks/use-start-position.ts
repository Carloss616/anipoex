import { type RefObject, useRef, useState } from "react";
import type { LegendListRef } from "@/components/layout/legend-list";
import { startAt } from "@/features/manga/state/reading-positions";

type Start = ReturnType<typeof startAt>;

/**
 * Opens the chapter at its saved page. The list takes the page at mount and
 * only knows the page's height once it loads, so the offset into it is
 * applied as its size arrives, until the user drags.
 */
export function useStartPosition({
  mangaId,
  sourceId,
  chapterId,
  pages,
  listRef,
}: {
  mangaId: number;
  sourceId: string | undefined;
  chapterId: string;
  pages: number;
  listRef: RefObject<LegendListRef | null>;
}) {
  // Read once per chapter: saving moves the position on while it's read.
  const [snapshot, setSnapshot] = useState<{ key: string; at: Start }>();
  const key = `${sourceId}/${chapterId}`;
  let start = snapshot?.at;
  if (sourceId && snapshot?.key !== key) {
    start = startAt(mangaId, sourceId, chapterId);
    setSnapshot({ key, at: start });
  }
  const dragged = useRef<string>(undefined);
  // A source can re-upload a chapter with fewer pages.
  const index = start && pages > 0 ? Math.min(start.page, pages) - 1 : 0;

  return {
    initialScrollIndex: start && pages > 0 ? index : undefined,
    onItemSizeChanged: (item: { index: number; size: number }) => {
      if (!start?.offset || item.index !== index || dragged.current === key)
        return;
      // shortcut: web has no drag event, so a page loading after a wheel
      // scroll pulls it back; stop on wheel if that shows up.
      void listRef.current?.scrollToIndex({
        index,
        viewOffset: -start.offset * item.size,
        animated: false,
      });
    },
    onScrollBeginDrag: () => {
      dragged.current = key;
    },
  };
}
