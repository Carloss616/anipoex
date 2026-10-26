import { useValue } from "@legendapp/state/react";
import { chapters$, chaptersKey } from "@/features/manga/state/chapters";
import { manualMatches$ } from "@/features/manga/state/manual-matches";

/** The source's current match page, set by hand or read last; undefined until it has one. */
export const useMatchUrl = (mangaKey: string, sourceId: string) =>
  useValue(
    () =>
      (
        manualMatches$[mangaKey][sourceId].get() ??
        chapters$[chaptersKey(mangaKey, sourceId)].manga.get()
      )?.url,
  );
