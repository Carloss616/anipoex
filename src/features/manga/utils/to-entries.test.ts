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

  it("maps an entry and drops null genres", () => {
    const data = query([
      {
        entries: [
          entry({
            id: 30002,
            title: { userPreferred: "Berserk" },
            coverImage: { large: "https://img/berserk.jpg" },
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
        year: "1989",
        genres: ["Action", "Drama"],
        cover: "https://img/berserk.jpg",
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
        year: "",
        genres: [],
        cover: null,
        progress: 0,
        chapters: null,
      },
    ]);
  });
});
