import { describe, expect, it } from "bun:test";
import type { MangaListQuery } from "../graphql/manga-list.generated";
import { toEntries } from "./to-entries";

const entry = (media: object | null) => ({
  id: 1,
  progress: 12,
  score: null,
  media,
});

const query = (lists: unknown) =>
  ({ MediaListCollection: { lists } }) as MangaListQuery;

describe("toEntries", () => {
  it("returns an empty list when there is no data", () => {
    expect(toEntries(undefined)).toEqual([]);
    expect(toEntries(query(null))).toEqual([]);
    expect(toEntries(query([null]))).toEqual([]);
  });

  it("drops entries with no media instead of rendering a hole", () => {
    expect(toEntries(query([{ entries: [entry(null), null] }]))).toEqual([]);
  });

  it("maps an entry, drops null genres and dedupes titles", () => {
    const data = query([
      {
        entries: [
          entry({
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
          }),
        ],
      },
    ]);

    expect(toEntries(data)).toEqual([
      {
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
      },
    ]);
  });

  it("survives a media with every optional field missing", () => {
    const data = query([
      {
        entries: [
          {
            id: 2,
            progress: null,
            score: null,
            media: {
              id: 7,
              title: null,
              coverImage: null,
              startDate: null,
              genres: null,
              chapters: null,
            },
          },
        ],
      },
    ]);

    expect(toEntries(data)).toEqual([
      {
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
      },
    ]);
  });
});
