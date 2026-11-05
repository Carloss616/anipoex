import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect } from "react";
import { useMangaEntry } from "@/features/manga/hooks/use-manga-entry";
import { useSourceMatch } from "@/features/manga/hooks/use-source-match";
import { useSourceSearch } from "@/features/manga/hooks/use-source-search";
import { useTrackingEntry } from "@/features/manga/hooks/use-tracking-entry";
import { stopTitleSearch } from "@/features/manga/state/title-search";
import {
  isOverDetail,
  sourceListHref,
} from "@/features/manga/utils/source-list-href";

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
  const navigation = useNavigation();
  const router = useRouter();
  // Read from the cache the detail filled; a cold link fetches it.
  const { manga } = useMangaEntry(id);
  const { match } = useSourceMatch(mangaId);
  const search = useSourceSearch(manga);
  const read = useTrackingEntry(manga?.mediaListEntry?.id)?.progress ?? 0;

  // A link straight to the list (or a web reload) puts the detail under it.
  useEffect(() => {
    const state = navigation.getState();
    if (!state || isOverDetail(state, id)) return;
    router.replace(`/manga/${id}`);
    router.push(sourceListHref(id, expanded === "1"));
  }, [navigation, router, id, expanded]);

  // Title results live while the list is open, however it closes.
  useEffect(() => () => stopTitleSearch(mangaId), [mangaId]);

  return {
    manga,
    read,
    selectedId: match?.sourceId,
    expanded: expanded === "1",
    /**
     * Leaves this route only: a second call, from a double tap or a browser
     * Back during the web close, can't pop the detail too.
     */
    close: () => navigation.goBack(),
    /** Searches the picked source; the caller closes the list. */
    pick: (nextId: string) => {
      // Re-picking a found match changes nothing; no match or pending retries.
      if (nextId === match?.sourceId && match.manga) return;
      search.select(nextId);
    },
  };
}
