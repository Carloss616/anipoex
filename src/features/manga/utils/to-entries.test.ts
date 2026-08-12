import { describe, expect, it } from "bun:test";
import { MediaListStatus } from "@/graphql/types.generated";
import type { MangaMediaFragment } from "../graphql/manga-fragments.generated";
import type { MangaListQuery } from "../graphql/manga-list.generated";
import { toEntries, toEntry } from "./to-entries";

const listEntry = {
  id: 1,
  status: MediaListStatus.Current,
  progress: 12,
  score: null,
  startedAt: null,
  completedAt: null,
  notes: null,
};

const berserk = {
  id: 30002,
  title: {
    userPreferred: "Berserk",
    english: "Berserk",
    romaji: "Berserk",
    native: "ベルセルク",
  },
  coverImage: {
    large: "https://img/berserk.jpg",
    medium: "https://img/berserk-small.jpg",
    color: "#1a1a1a",
  },
  startDate: { year: 1989 },
  genres: ["Action", null, "Drama"],
  chapters: 374,
  mediaListEntry: listEntry,
};

const berserkEntry = {
  id: "30002",
  title: "Berserk",
  titles: ["Berserk", "ベルセルク"],
  year: "1989",
  genres: ["Action", "Drama"],
  cover: "https://img/berserk.jpg",
  coverThumb: "https://img/berserk-small.jpg",
  coverColor: "#1a1a1a",
  progress: 12,
  chapters: 374,
  score: null,
  listStatus: MediaListStatus.Current,
};

const query = (lists: unknown) =>
  ({ MediaListCollection: { lists } }) as MangaListQuery;

describe("toEntries", () => {
  it("returns an empty list when there is no data", () => {
    expect(toEntries(undefined)).toEqual([]);
    expect(toEntries(query(null))).toEqual([]);
    expect(toEntries(query([null]))).toEqual([]);
  });

  it("drops entries with no media instead of rendering a hole", () => {
    const data = query([{ entries: [{ id: 1, media: null }, null] }]);
    expect(toEntries(data)).toEqual([]);
  });

  it("maps an entry, drops null genres and dedupes titles", () => {
    const data = query([{ entries: [{ id: 1, media: berserk }] }]);
    expect(toEntries(data)).toEqual([berserkEntry]);
  });
});

describe("toEntry", () => {
  it("survives a media with every optional field missing", () => {
    const media = {
      title: null,
      coverImage: null,
      startDate: null,
      genres: null,
      chapters: null,
      mediaListEntry: null,
    } as MangaMediaFragment;

    expect(toEntry(7, media)).toEqual({
      id: "7",
      title: "",
      titles: [],
      year: "",
      genres: [],
      cover: null,
      coverThumb: null,
      coverColor: null,
      progress: 0,
      chapters: null,
      score: null,
      listStatus: null,
    });
  });

  it("returns null when there is no media", () => {
    expect(toEntry(7, null)).toBeNull();
  });
});
