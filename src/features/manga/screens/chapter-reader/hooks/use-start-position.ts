import { useState } from "react";
import { readingPositions$ } from "@/features/manga/state/reading-positions";
import { mediaKey } from "@/features/manga/utils/msu";

type Start = { page: number; offset: number } | undefined;

/**
 * Where the chapter opens: its saved page when that is this very chapter in
 * this source. Read once per chapter, since the list takes it only at mount
 * and saving moves it on.
 */
export function useStartPosition(
  mangaId: number,
  sourceId: string | undefined,
  chapterId: string,
): Start {
  const [start, setStart] = useState<{ key: string; at: Start }>();
  const key = `${sourceId}/${chapterId}`;
  if (sourceId && start?.key !== key) {
    const saved = readingPositions$[mediaKey(mangaId)].peek();
    const at =
      saved?.sourceId === sourceId &&
      saved.chapterId === chapterId &&
      (saved.page > 1 || saved.offset > 0)
        ? { page: saved.page, offset: saved.offset }
        : undefined;
    setStart({ key, at });
    return at;
  }
  return start?.at;
}
