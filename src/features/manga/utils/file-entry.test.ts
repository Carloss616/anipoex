import { describe, expect, it } from "bun:test";
import { gql, InMemoryCache } from "@apollo/client";
import { MediaListStatus } from "@/graphql/types.generated";
import {
  MangaListCountsDocument,
  MangaListDocument,
  type MangaListQuery,
} from "../graphql/manga-list.generated";
import {
  dropCustomList,
  fileEntry,
  refileEntry,
  renameCustomList,
  wholeCollection,
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

const group = (ids: number[], name = "Reading", isCustomList = false) => ({
  __typename: "MediaListGroup" as const,
  name,
  isCustomList,
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
    query: MangaListDocument,
    variables: wholeCollection(userId),
    data: {
      MediaListCollection: {
        __typename: "MediaListCollection",
        lists: [group([1, 2]), group([1], "List A", true)],
      },
    },
  });
  cache.writeQuery({
    query: MangaListCountsDocument,
    variables: { userId },
    data: {
      MediaListCollection: {
        __typename: "MediaListCollection",
        lists: [
          {
            __typename: "MediaListGroup",
            name: "Reading",
            status: MediaListStatus.Current,
            isCustomList: false,
            entries: [1, 2].map((id) => ({
              __typename: "MediaList" as const,
              id,
            })),
          },
          {
            __typename: "MediaListGroup",
            name: "List A",
            status: null,
            isCustomList: true,
            entries: [{ __typename: "MediaList", id: 1 }],
          },
        ],
        user: {
          __typename: "User",
          id: userId,
          mediaListOptions: {
            __typename: "MediaListOptions",
            mangaList: {
              __typename: "MediaListTypeOptions",
              customLists: ["List A", "List B"],
            },
          },
        },
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

  /** Custom groups by name, from the whole collection and from the counts. */
  const custom = () =>
    [
      cache.readQuery({
        query: MangaListDocument,
        variables: wholeCollection(userId),
      }),
      cache.readQuery({
        query: MangaListCountsDocument,
        variables: { userId },
      }),
    ].map((data) =>
      Object.fromEntries(
        data?.MediaListCollection?.lists
          ?.filter((l) => l?.isCustomList)
          .map((l) => [l?.name, l?.entries?.map((e) => e?.id)]) ?? [],
      ),
    );

  return { cache, ids, counts, custom };
}

describe("fileEntry custom lists", () => {
  it("moves an entry between the lists it names", () => {
    const { cache, ids, custom } = setup();
    const customLists = { "List A": false, "List B": true };
    fileEntry(
      cache,
      userId,
      { ...entry(1), customLists },
      MediaListStatus.Current,
    );

    const lists = { "List A": [], "List B": [1] };
    expect(custom()).toEqual([lists, lists]);
    expect(ids(MediaListStatus.Current)).toEqual([1, 2]);
  });

  it("leaves them alone when the entry doesn't say", () => {
    const { cache, custom } = setup();
    fileEntry(cache, userId, entry(1), MediaListStatus.Planning);

    expect(custom()).toEqual([{ "List A": [1] }, { "List A": [1] }]);
  });

  it("drops a deleted list's group", () => {
    const { cache, custom } = setup();
    dropCustomList(cache, userId, "List A");

    expect(custom()).toEqual([{}, {}]);
  });

  it("renames a list's groups and the entries' flags", () => {
    const { cache, custom } = setup();
    cache.writeFragment({
      id: "MediaList:1",
      fragment: gql`
        fragment Flags on MediaList {
          customLists
        }
      `,
      data: { __typename: "MediaList", customLists: { "List A": true } },
    });
    renameCustomList(cache, userId, "List A", "List C");

    expect(custom()).toEqual([{ "List C": [1] }, { "List C": [1] }]);
    expect(cache.extract()["MediaList:1"]?.customLists).toEqual({
      "List C": true,
    });
  });

  it("takes a removed entry out of every list", () => {
    const { cache, custom } = setup();
    fileEntry(cache, userId, { ...entry(1), media: null }, null);

    expect(custom()).toEqual([{ "List A": [] }, { "List A": [] }]);
  });
});

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

  it("moves custom lists too", () => {
    const { cache, custom } = setup();
    refileEntry(cache, userId, 1, {
      ...refreshed(1, MediaListStatus.Current),
      mediaListEntry: {
        ...refreshed(1, MediaListStatus.Current).mediaListEntry,
        customLists: { "List A": false },
      },
    });

    expect(custom()).toEqual([{ "List A": [] }, { "List A": [] }]);
  });

  it("drops an entry removed or replaced elsewhere", () => {
    const { cache, ids } = setup();
    refileEntry(cache, userId, 2, { ...entry(2).media, mediaListEntry: null });
    refileEntry(cache, userId, 1, refreshed(3, MediaListStatus.Planning));

    expect(ids(MediaListStatus.Current)).toEqual([]);
    expect(ids(MediaListStatus.Planning)).toEqual([3]);
  });
});
