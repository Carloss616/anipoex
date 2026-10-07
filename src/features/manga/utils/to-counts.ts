import type { MediaListStatus } from "@/graphql/types.generated";
import { MANGA_STATUS_ENTRIES } from "../constants";
import type { MangaListCountsQuery } from "../graphql/manga-list-counts.generated";

export type ListCounts = Record<MediaListStatus, number | null>;

/**
 * Entries per status, `null` until loaded. Custom lists hold entries already
 * filed under a status, so they never add to a count.
 */
export function toCounts(data: MangaListCountsQuery | undefined): ListCounts {
  const lists = data?.MediaListCollection?.lists;

  return Object.fromEntries(
    MANGA_STATUS_ENTRIES.map(([status]) => [
      status,
      lists
        ? lists.reduce(
            (n, list) =>
              list && !list.isCustomList && list.status === status
                ? n + (list.entries?.length ?? 0)
                : n,
            0,
          )
        : null,
    ]),
  ) as ListCounts;
}
