import type { ApolloCache } from "@apollo/client";
import type {
  FuzzyDateInput,
  MediaListStatus,
} from "@/graphql/types.generated";
import { MANGA_STATUS_ENTRIES } from "../constants";
import {
  MangaMediaFragmentDoc,
  MangaTrackingFragmentDoc,
} from "../graphql/manga-fragments.generated";
import {
  MangaListDocument,
  type MangaListQuery,
} from "../graphql/manga-list.generated";
import { MangaListCountsDocument } from "../graphql/manga-list-counts.generated";
import type { CachedFields } from "../state/pending-entries";

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

/**
 * A save's cache update. Apollo merges the returned entry and its media by id
 * on its own; what it can't infer is which lists hold the entry, nor the
 * media's link to it, which AniList returns as null even on an edit.
 */
export function fileSaved(
  cache: ApolloCache,
  userId: number | undefined,
  mediaId: number,
  entry: (ListEntry & { status: MediaListStatus | null }) | null | undefined,
) {
  if (!entry || userId == null) return;

  fileEntry(cache, userId, entry, entry.status);
  // Last: filing it writes the returned media, whose link is null.
  cache.modify({
    id: cache.identify({ __typename: "Media", id: mediaId }),
    fields: { mediaListEntry: () => ({ __ref: cache.identify(entry) }) },
  });
}

/** A removal's cache update: out of every list, the media's link and the cache. */
export function fileDeleted(
  cache: ApolloCache,
  userId: number | undefined,
  mediaId: number,
  entryId: number,
) {
  fileRemoved(cache, userId, mediaId, entryId);
  cache.evict({ id: cache.identify({ __typename: "MediaList", id: entryId }) });
  cache.gc();
}

/** Out of every list and the media's link, kept in the cache to put back. */
export function fileRemoved(
  cache: ApolloCache,
  userId: number | undefined,
  mediaId: number,
  entryId: number,
) {
  const entry = { __typename: "MediaList" as const, id: entryId, media: null };
  if (userId != null) fileEntry(cache, userId, entry, null);

  cache.modify({
    id: cache.identify({ __typename: "Media", id: mediaId }),
    fields: { mediaListEntry: () => null },
  });
}

const fuzzy = (date: FuzzyDateInput | null) =>
  date && { year: date.year, month: date.month, day: date.day };

/** What the cached entry shows, for a queued change to put back. */
export function cachedFields(
  cache: ApolloCache,
  entryId: number,
): CachedFields | undefined {
  const entry = cache.readFragment({
    fragment: MangaTrackingFragmentDoc,
    fragmentName: "MangaTracking",
    id: `MediaList:${entryId}`,
  });
  if (!entry) return undefined;
  return {
    entryId,
    status: entry.status,
    progress: entry.progress,
    score: entry.score,
    startedAt: fuzzy(entry.startedAt),
    completedAt: fuzzy(entry.completedAt),
  };
}

/**
 * Shows a change made offline: writes the fields on the entry, links the
 * media to it and, when the status is among them, files it there.
 */
export function fileEdited(
  cache: ApolloCache,
  userId: number | undefined,
  mediaId: number,
  entryId: number,
  fields: Partial<Omit<CachedFields, "entryId">>,
) {
  const ref = `MediaList:${entryId}`;
  cache.modify({
    id: ref,
    fields: Object.fromEntries(
      Object.entries(fields).map(([name, value]) => [name, () => value]),
    ),
  });
  cache.modify({
    id: `Media:${mediaId}`,
    fields: { mediaListEntry: () => ({ __ref: ref }) },
  });

  if (userId == null || !("status" in fields)) return;
  const media = cache.readFragment({
    fragment: MangaMediaFragmentDoc,
    fragmentName: "MangaMedia",
    id: `Media:${mediaId}`,
  });
  // A list row shows its media: without it cached, the lists stay as they are
  if (!media) return;
  fileEntry(
    cache,
    userId,
    { __typename: "MediaList", id: entryId, media: { ...media, id: mediaId } },
    fields.status ?? null,
  );
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
    mediaListEntry: { id: number; status: MediaListStatus | null } | null;
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
      { __typename: type, id: entry.id, media },
      entry.status,
    );
  }
}
