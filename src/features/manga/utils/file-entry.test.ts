import { describe, expect, it } from "bun:test";
import { InMemoryCache } from "@apollo/client";
import { MediaListStatus } from "@/graphql/types.generated";
import {
  MangaMediaFragmentDoc,
  MangaTrackingFragmentDoc,
} from "../graphql/manga-fragments.generated";
import {
  MangaListDocument,
  type MangaListQuery,
} from "../graphql/manga-list.generated";
import { MangaListCountsDocument } from "../graphql/manga-list-counts.generated";
import {
  cachedFields,
  fileEdited,
  fileEntry,
  fileRemoved,
  refileEntry,
} from "./file-entry";

const userId = 1;

const entry = (id: number) => ({
  __typename: "MediaList" as const,
  id,
  media: {
    __typename: "Media" as const,
    id: id * 10,
    synonyms: [],
    genres: [],
    status: null,
    chapters: null,
    mediaListEntry: { __typename: "MediaList" as const, id, progress: 0 },
    title: null,
    coverImage: null,
  },
});

const group = (ids: number[]) => ({
  __typename: "MediaListGroup" as const,
  entries: ids.map(entry),
});

function setup() {
  const cache = new InMemoryCache();
  const list = (status: MediaListStatus, lists: ReturnType<typeof group>[]) =>
    cache.writeQuery({
      query: MangaListDocument,
      variables: { userId, status },
      data: {
        MediaListCollection: { __typename: "MediaListCollection", lists },
      },
    });
  list(MediaListStatus.Current, [group([1, 2])]);
  list(MediaListStatus.Planning, []);
  cache.writeQuery({
    query: MangaListCountsDocument,
    variables: { userId },
    data: {
      MediaListCollection: {
        __typename: "MediaListCollection",
        lists: [
          {
            __typename: "MediaListGroup",
            status: MediaListStatus.Current,
            isCustomList: false,
            entries: [1, 2].map((id) => ({
              __typename: "MediaList" as const,
              id,
            })),
          },
          {
            __typename: "MediaListGroup",
            status: null,
            isCustomList: true,
            entries: [{ __typename: "MediaList", id: 1 }],
          },
        ],
      },
    },
  });

  const ids = (status: MediaListStatus) =>
    cache
      .readQuery<MangaListQuery>({
        query: MangaListDocument,
        variables: { userId, status },
      })
      ?.MediaListCollection?.lists?.flatMap(
        (l) => l?.entries?.map((e) => e?.id) ?? [],
      );
  const counts = () =>
    cache
      .readQuery({ query: MangaListCountsDocument, variables: { userId } })
      ?.MediaListCollection?.lists?.map((l) => [
        l?.status,
        l?.entries?.map((e) => e?.id),
      ]);

  return { cache, ids, counts };
}

describe("fileEntry", () => {
  it("moves an entry to its new status, lists and counts", () => {
    const { cache, ids, counts } = setup();
    fileEntry(cache, userId, entry(1), MediaListStatus.Planning);

    expect(ids(MediaListStatus.Current)).toEqual([2]);
    expect(ids(MediaListStatus.Planning)).toEqual([1]);
    expect(counts()).toEqual([
      [MediaListStatus.Current, [2]],
      [null, [1]],
      [MediaListStatus.Planning, [1]],
    ]);
  });

  it("adds a new entry first and leaves uncached lists alone", () => {
    const { cache, ids } = setup();
    fileEntry(cache, userId, entry(3), MediaListStatus.Current);

    expect(ids(MediaListStatus.Current)).toEqual([3, 1, 2]);
    expect(ids(MediaListStatus.Completed)).toBeUndefined();
  });

  it("removes an entry from every list on null", () => {
    const { cache, ids, counts } = setup();
    fileEntry(cache, userId, { ...entry(2), media: null }, null);

    expect(ids(MediaListStatus.Current)).toEqual([1]);
    expect(counts()?.[0]).toEqual([MediaListStatus.Current, [1]]);
  });
});

describe("refileEntry", () => {
  const refreshed = (id: number, status: MediaListStatus) => ({
    ...entry(id).media,
    mediaListEntry: { ...entry(id).media.mediaListEntry, status },
  });

  it("moves an entry whose status changed elsewhere", () => {
    const { cache, ids } = setup();
    refileEntry(cache, userId, 1, refreshed(1, MediaListStatus.Planning));

    expect(ids(MediaListStatus.Current)).toEqual([2]);
    expect(ids(MediaListStatus.Planning)).toEqual([1]);
  });

  it("drops an entry removed or replaced elsewhere", () => {
    const { cache, ids } = setup();
    refileEntry(cache, userId, 2, { ...entry(2).media, mediaListEntry: null });
    refileEntry(cache, userId, 1, refreshed(3, MediaListStatus.Planning));

    expect(ids(MediaListStatus.Current)).toEqual([]);
    expect(ids(MediaListStatus.Planning)).toEqual([3]);
  });
});

describe("queued changes", () => {
  const NO_DATE = { year: null, month: null, day: null };
  const SHOWN = {
    entryId: 1,
    status: MediaListStatus.Current,
    progress: 3,
    score: 7,
    startedAt: { year: 2024, month: 1, day: 2 },
    completedAt: NO_DATE,
  };
  const { entryId: _, ...FIELDS } = SHOWN;

  function tracked() {
    const shown = setup();
    shown.cache.writeFragment({
      fragment: MangaTrackingFragmentDoc,
      fragmentName: "MangaTracking",
      id: "MediaList:1",
      data: {
        __typename: "MediaList",
        status: MediaListStatus.Current,
        progress: 3,
        repeat: 0,
        score: 7,
        startedAt: { __typename: "FuzzyDate", year: 2024, month: 1, day: 2 },
        completedAt: { __typename: "FuzzyDate", ...NO_DATE },
        notes: null,
      },
    });
    const link = () =>
      shown.cache.readFragment({
        fragment: MangaMediaFragmentDoc,
        fragmentName: "MangaMedia",
        id: "Media:10",
      })?.mediaListEntry?.id;
    return { ...shown, link };
  }

  it("reads what the entry shows", () => {
    expect(cachedFields(tracked().cache, 1)).toEqual(SHOWN);
  });

  it("an edit shows on the entry and moves it to its new status", () => {
    const { cache, ids } = tracked();
    fileEdited(cache, userId, 10, 1, {
      status: MediaListStatus.Planning,
      score: 8,
      startedAt: { year: 2025, month: 6, day: 10 },
    });

    expect(cachedFields(cache, 1)).toEqual({
      ...SHOWN,
      status: MediaListStatus.Planning,
      score: 8,
      startedAt: { year: 2025, month: 6, day: 10 },
    });
    expect(ids(MediaListStatus.Current)).toEqual([2]);
    expect(ids(MediaListStatus.Planning)).toEqual([1]);
  });

  it("a removal unlinks the entry but keeps it to put back", () => {
    const { cache, ids, link } = tracked();
    fileRemoved(cache, userId, 10, 1);

    expect(ids(MediaListStatus.Current)).toEqual([2]);
    expect(link()).toBeUndefined();
    expect(cachedFields(cache, 1)).toEqual(SHOWN);
  });

  it("putting the fields back undoes a removal", () => {
    const { cache, ids, link } = tracked();
    fileRemoved(cache, userId, 10, 1);
    fileEdited(cache, userId, 10, 1, FIELDS);

    expect(ids(MediaListStatus.Current)).toEqual([1, 2]);
    expect(link()).toBe(1);
    expect(cachedFields(cache, 1)).toEqual(SHOWN);
  });
});
