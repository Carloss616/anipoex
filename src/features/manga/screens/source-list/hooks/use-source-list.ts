import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useMangaEntry } from "@/features/manga/hooks/use-manga-entry";
import { useSourceMatch } from "@/features/manga/hooks/use-source-match";
import { useSourceSearch } from "@/features/manga/hooks/use-source-search";
import { useTrackingEntry } from "@/features/manga/hooks/use-tracking-entry";
import { stopTitleSearch } from "@/features/manga/state/title-search";

/**
 * The route's manga and the source it reads. A pick confirms by choosing, so
 * the list carries no Save, as the tracking sheet's fields commit themselves.
 */
export function useSourceList() {
  const { id, expanded } = useLocalSearchParams<{
    id: string;
    expanded?: string;
  }>();
  const mangaId = Number(id);
  // Read from the cache the detail filled; a cold link fetches it.
  const { manga } = useMangaEntry(id);
  const { match } = useSourceMatch(mangaId);
  const search = useSourceSearch(manga);
  const read = useTrackingEntry(manga?.mediaListEntry?.id)?.progress ?? 0;

  // Title results live while the list is open, however it closes.
  useEffect(() => () => stopTitleSearch(mangaId), [mangaId]);

  return {
    manga,
    read,
    selectedId: match?.sourceId,
    expanded: expanded === "1",
    /** Searches the picked source; the caller closes the list. */
    pick: (nextId: string) => {
      // Re-picking a found match changes nothing; no match or pending retries.
      if (nextId === match?.sourceId && match.manga) return;
      search.select(nextId);
    },
  };
}
