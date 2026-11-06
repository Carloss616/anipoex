import type { ApolloCache } from "@apollo/client";
import type { MediaListStatus } from "@/graphql/types.generated";
import { MANGA_STATUS_ENTRIES } from "../constants";
import {
  MangaListDocument,
  type MangaListQuery,
} from "../graphql/manga-list.generated";
import { MangaListCountsDocument } from "../graphql/manga-list-counts.generated";

type Lists = NonNullable<
  NonNullable<MangaListQuery["MediaListCollection"]>["lists"]
>;
type ListEntry = NonNullable<
  NonNullable<NonNullable<Lists[number]>["entries"]>[number]
>;

const holds = (
  list: { entries: ({ id: number } | null)[] | null } | null,
  id: number,
) => list?.entries?.some((e) => e?.id === id) ?? false;

const drop = <L extends { entries: ({ id: number } | null)[] | null } | null>(
  list: L,
  id: number,
): L =>
  list && {
    ...list,
    entries: list.entries?.filter((e) => e?.id !== id) ?? null,
  };

/**
 * Files an entry under `status` in the cached lists and counts and takes it out
 * of the others, so a save shows everywhere without a refetch. `null` removes
 * it. A list not cached yet loads with it when opened.
 */
export function fileEntry(
  cache: ApolloCache,
  userId: number,
  entry: ListEntry,
  status: MediaListStatus | null,
) {
  for (const [listStatus] of MANGA_STATUS_ENTRIES) {
    cache.updateQuery(
      { query: MangaListDocument, variables: { userId, status: listStatus } },
      (data) => {
        const collection = data?.MediaListCollection;
        const lists = collection?.lists ?? [];
        const present = lists.some((list) => holds(list, entry.id));
        if (!collection || present === (listStatus === status)) return;

        const [first = null, ...rest] = lists;
        return {
          MediaListCollection: {
            ...collection,
            lists: present
              ? lists.map((list) => drop(list, entry.id))
              : [
                  {
                    __typename: "MediaListGroup" as const,
                    // Shown first, where the user looks for what they added.
                    entries: [entry, ...(first?.entries ?? [])],
                  },
                  ...rest,
                ],
          },
        };
      },
    );
  }

  cache.updateQuery(
    { query: MangaListCountsDocument, variables: { userId } },
    (data) => {
      const collection = data?.MediaListCollection;
      const filed = collection?.lists?.some(
        (list) =>
          list &&
          !list.isCustomList &&
          list.status === status &&
          holds(list, entry.id),
      );
      if (!collection || filed) return;

      // Custom lists hold entries already filed under a status: left as is.
      const lists = (collection.lists ?? []).map((list) =>
        list?.isCustomList ? list : drop(list, entry.id),
      );
      const target = lists.findIndex(
        (list) => list && !list.isCustomList && list.status === status,
      );
      const ref = { __typename: "MediaList" as const, id: entry.id };

      if (target >= 0) {
        const list = lists[target];
        if (list) list.entries = [ref, ...(list.entries ?? [])];
      } else if (status) {
        lists.push({
          __typename: "MediaListGroup",
          status,
          isCustomList: false,
          entries: [ref],
        });
      }
      return { MediaListCollection: { ...collection, lists } };
    },
  );
}
