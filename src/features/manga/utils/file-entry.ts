import type { ApolloCache } from "@apollo/client";
import type { MediaListStatus } from "@/graphql/types.generated";
import { MANGA_STATUS_ENTRIES } from "../constants";
import {
  MangaListCountsDocument,
  MangaListDocument,
  type MangaListQuery,
} from "../graphql/manga-list.generated";
import { enabledLists, renameList } from "./enabled-lists";

/** MangaList's variables for the whole collection, custom groups included. */
export const wholeCollection = (userId: number) => ({
  userId,
  forceSingleCompletedList: false,
});

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

type Group = {
  name: string | null;
  isCustomList: boolean | null;
  entries: ({ id: number } | null)[] | null;
};

/**
 * Puts `item` in the custom groups named in `names` and takes it out of the
 * others; a named list with no group yet (empty) gets one. Undefined when
 * nothing changes.
 */
function fileCustom<G extends Group>(
  lists: (G | null)[],
  item: NonNullable<NonNullable<G["entries"]>[number]>,
  names: string[],
  blank: Omit<G, keyof Group>,
) {
  let changed = false;
  const next = lists.map((list) => {
    if (!list?.isCustomList) return list;
    const on = names.includes(list.name ?? "");
    if (on === holds(list, item.id)) return list;
    changed = true;
    return on
      ? { ...list, entries: [item, ...(list.entries ?? [])] }
      : drop(list, item.id);
  });
  for (const name of names) {
    if (lists.some((list) => list?.isCustomList && list.name === name))
      continue;
    changed = true;
    next.push({ ...blank, name, isCustomList: true, entries: [item] } as G);
  }
  return changed ? next : undefined;
}

/**
 * Files an entry under `status` in the cached lists and counts and takes it out
 * of the others, so a save shows everywhere without a refetch. `null` removes
 * it. A list not cached yet loads with it when opened. An entry that carries
 * `customLists` also moves between the custom lists it names.
 */
export function fileEntry(
  cache: ApolloCache,
  userId: number,
  entry: ListEntry & { customLists?: unknown },
  status: MediaListStatus | null,
) {
  const names =
    status === null
      ? []
      : entry.customLists === undefined
        ? undefined
        : enabledLists(entry.customLists);
  if (names) {
    const group = { __typename: "MediaListGroup" as const };
    cache.updateQuery(
      { query: MangaListDocument, variables: wholeCollection(userId) },
      (data) => {
        const collection = data?.MediaListCollection;
        const { customLists: _, ...item } = entry;
        const lists = fileCustom(collection?.lists ?? [], item, names, group);
        return collection && lists
          ? { MediaListCollection: { ...collection, lists } }
          : undefined;
      },
    );
    cache.updateQuery(
      { query: MangaListCountsDocument, variables: { userId } },
      (data) => {
        const collection = data?.MediaListCollection;
        const ref = { __typename: "MediaList" as const, id: entry.id };
        const lists = fileCustom(collection?.lists ?? [], ref, names, {
          ...group,
          status: null,
        });
        return collection && lists
          ? { MediaListCollection: { ...collection, lists } }
          : undefined;
      },
    );
  }

  for (const [listStatus] of MANGA_STATUS_ENTRIES) {
    cache.updateQuery(
      { query: MangaListDocument, variables: { userId, status: listStatus } },
      (data) => {
        const collection = data?.MediaListCollection;
        const lists = collection?.lists ?? [];
        const present = lists.some((list) => holds(list, entry.id));
        if (!collection || present === (listStatus === status)) return;

        // Custom groups come after the status's own, so `first` is that one.
        const [first = null, ...rest] = lists;
        return {
          MediaListCollection: {
            ...collection,
            lists: present
              ? lists.map((list) => drop(list, entry.id))
              : [
                  {
                    __typename: "MediaListGroup" as const,
                    name: first?.name ?? null,
                    isCustomList: false,
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
          name: null,
          status,
          isCustomList: false,
          entries: [ref],
        });
      }
      return { MediaListCollection: { ...collection, lists } };
    },
  );
}

/** Edits the groups of the cached collection and counts, as a list changes. */
function editGroups(
  cache: ApolloCache,
  userId: number,
  edit: <G extends Group>(lists: (G | null)[]) => (G | null)[],
) {
  cache.updateQuery(
    { query: MangaListDocument, variables: wholeCollection(userId) },
    (data) =>
      data?.MediaListCollection && {
        MediaListCollection: {
          ...data.MediaListCollection,
          lists: edit(data.MediaListCollection.lists ?? []),
        },
      },
  );
  cache.updateQuery(
    { query: MangaListCountsDocument, variables: { userId } },
    (data) =>
      data?.MediaListCollection && {
        MediaListCollection: {
          ...data.MediaListCollection,
          lists: edit(data.MediaListCollection.lists ?? []),
        },
      },
  );
}

/** Takes a deleted custom list's group out of the cached collection and counts. */
export function dropCustomList(
  cache: ApolloCache,
  userId: number,
  name: string,
) {
  editGroups(cache, userId, (lists) =>
    lists.filter((list) => !(list?.isCustomList && list.name === name)),
  );
}

/**
 * Renames a custom list's groups and the flag every cached entry keeps under
 * its name, which the tracking form reads.
 */
export function renameCustomList(
  cache: ApolloCache,
  userId: number,
  from: string,
  to: string,
) {
  editGroups(cache, userId, (lists) =>
    lists.map((list) =>
      list?.isCustomList && list.name === from ? { ...list, name: to } : list,
    ),
  );
  for (const id of Object.keys(cache.extract() as object)) {
    if (!id.startsWith("MediaList:")) continue;
    cache.modify({
      id,
      fields: {
        customLists: (value) => renameList(value, from, to) as typeof value,
      },
    });
  }
}

/**
 * A save's cache update. Apollo merges the returned entry and its media by id
 * on its own; what it can't infer is which lists hold the entry, nor the
 * media's link to it, which AniList returns as null even on an edit.
 */
export function fileSaved(
  cache: ApolloCache,
  userId: number | undefined,
  mediaId: number,
  entry:
    | (ListEntry & { status: MediaListStatus | null; customLists?: unknown })
    | null
    | undefined,
) {
  if (!entry || userId == null) return;

  fileEntry(cache, userId, entry, entry.status);
  // Last: filing it writes the returned media, whose link is null.
  cache.modify({
    id: cache.identify({ __typename: "Media", id: mediaId }),
    fields: {
      mediaListEntry: () => ({
        __ref: cache.identify({ __typename: "MediaList", id: entry.id }),
      }),
    },
  });
}

/**
 * Files a refetched media's entry where its status says, as a save does: a
 * change made outside the app only rewrites the entry, not the lists that hold
 * it. `priorId` is the entry the app had, dropped if it's gone or replaced.
 */
export function refileEntry(
  cache: ApolloCache,
  userId: number,
  priorId: number | undefined,
  media: NonNullable<ListEntry["media"]> & {
    mediaListEntry: {
      id: number;
      status: MediaListStatus | null;
      customLists?: unknown;
    } | null;
  },
) {
  const entry = media.mediaListEntry;
  const type = "MediaList" as const;
  if (priorId != null && priorId !== entry?.id) {
    fileEntry(
      cache,
      userId,
      { __typename: type, id: priorId, media: null },
      null,
    );
  }
  if (entry) {
    fileEntry(
      cache,
      userId,
      { __typename: type, id: entry.id, media, customLists: entry.customLists },
      entry.status,
    );
  }
}
