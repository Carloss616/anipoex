import { describe, expect, it } from "bun:test";
import { InMemoryCache } from "@apollo/client";
import { MediaListStatus } from "@/graphql/types.generated";
import {
  MangaListDocument,
  type MangaListQuery,
} from "../graphql/manga-list.generated";
import { MangaListCountsDocument } from "../graphql/manga-list-counts.generated";
import { fileEntry } from "./file-entry";

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
