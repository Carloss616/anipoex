import { useValue } from "@legendapp/state/react";
import { readingPositions$ } from "@/features/manga/state/reading-positions";
import { pageLabel } from "@/features/manga/utils/reading-position";

/** "Page 8 of 40" on the chapter being read; a save re-renders only its row. */
export const useChapterPage = (
  mangaId: number,
  sourceId: string | undefined,
  chapterId: string,
) =>
  useValue(() =>
    pageLabel(readingPositions$[mangaId].get(), sourceId, chapterId),
  );
