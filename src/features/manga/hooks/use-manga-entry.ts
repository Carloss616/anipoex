import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useMangaQuery } from "../graphql/manga.generated";
import type { MangaListQuery } from "../graphql/manga-list.generated";
import { toEntry } from "../utils/to-entries";

export const MANGA_LIST_KEY = "MangaList";

/**
 * Rebuilds a `Manga` response out of whichever cached `MangaList` already holds
 * this id — both queries select the same fragments, so the shapes line up.
 * `dataUpdatedAt` rides along so the detail inherits the list's freshness
 * instead of pretending it was just fetched.
 */
function seedFromList(queryClient: QueryClient, id: number) {
  for (const [queryKey] of queryClient.getQueriesData<MangaListQuery>({
    queryKey: [MANGA_LIST_KEY],
  })) {
    const state = queryClient.getQueryState<MangaListQuery>(queryKey);

    for (const list of state?.data?.MediaListCollection?.lists ?? []) {
      for (const entry of list?.entries ?? []) {
        if (entry?.media?.id !== id) continue;

        // Drop `media` off the entry so the seed doesn't nest a second copy.
        const { media, ...listEntry } = entry;

        return {
          data: { Media: { ...media, mediaListEntry: listEntry } },
          updatedAt: state?.dataUpdatedAt,
        };
      }
    }
  }
}

/**
 * Resolves a manga by id: served instantly from the cached `MangaList` queries
 * when it's there, fetched from AniList when it isn't (deep link, cold start).
 */
export function useMangaEntry(id: string) {
  const queryClient = useQueryClient();
  const mediaId = Number(id);

  // Only read at mount — once the query owns data, initialData is ignored.
  const seed = useMemo(
    () => seedFromList(queryClient, mediaId),
    [queryClient, mediaId],
  );

  return useMangaQuery(
    { id: mediaId },
    {
      enabled: Number.isInteger(mediaId),
      initialData: seed?.data,
      initialDataUpdatedAt: seed?.updatedAt,
      select: (data) => toEntry(data.Media, data.Media?.mediaListEntry),
      meta: { error: "Couldn't load this manga" },
    },
  );
}
