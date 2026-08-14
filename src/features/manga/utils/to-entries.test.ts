import { describe, expect, it } from "bun:test";
import type { MangaListQuery } from "../graphql/manga-list.generated";
import { type MangaEntry, toEntries } from "./to-entries";

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
  mediaListEntry: { id: 1, progress: 12 },
} as unknown as MangaEntry;

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

  it("flattens the media out of every list", () => {
    const data = query([
      { entries: [{ id: 1, media: berserk }] },
      { entries: [{ id: 2, media: berserk }] },
    ]);
    expect(toEntries(data)).toEqual([berserk, berserk]);
  });
});
