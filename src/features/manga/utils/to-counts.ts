import type { MediaListStatus } from "@/graphql/types.generated";
import { MANGA_STATUS_ENTRIES } from "../constants";
import type { MangaListCountsQuery } from "../graphql/manga-list.generated";
import { customKey, type ListKey } from "./parse-list";

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

export interface CustomList {
  name: string;
  key: ListKey;
  count: number;
}

/**
 * The account's list names as AniList keeps them, repeats included: what a
 * change sends back, since a dropped repeat would move the lists after it.
 */
export const accountNames = (data: MangaListCountsQuery | null | undefined) =>
  data?.MediaListCollection?.user?.mediaListOptions?.mangaList?.customLists?.filter(
    (name) => name != null,
  ) ?? null;

/**
 * The account's custom lists in its order, null until loaded. An empty list
 * has no group, so it counts 0. A repeated name shows once: the app keys
 * lists by name.
 */
export function toCustomLists(
  data: MangaListCountsQuery | undefined,
): CustomList[] | null {
  const names = accountNames(data);
  if (!names) return null;

  return [...new Set(names)].map((name) => ({
    name,
    key: customKey(name),
    count:
      data?.MediaListCollection?.lists?.find(
        (list) => list?.isCustomList && list.name === name,
      )?.entries?.length ?? 0,
  }));
}
