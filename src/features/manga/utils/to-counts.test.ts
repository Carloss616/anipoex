import { describe, expect, it } from "bun:test";
import { MediaListStatus } from "@/graphql/types.generated";
import type { MangaListCountsQuery } from "../graphql/manga-list.generated";
import { toCounts, toCustomLists } from "./to-counts";

const list = (
  status: MediaListStatus | null,
  n: number,
  isCustomList = false,
) => ({
  status,
  isCustomList,
  entries: Array.from({ length: n }, (_, i) => ({ id: i })),
});

const data = (lists: ReturnType<typeof list>[]) =>
  ({ MediaListCollection: { lists } }) as MangaListCountsQuery;

describe("toCounts", () => {
  it("is null for every list until the query loads", () => {
    expect(Object.values(toCounts(undefined))).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
    ]);
  });

  it("counts entries per status and 0 for a status with no list", () => {
    const counts = toCounts(
      data([
        list(MediaListStatus.Current, 79),
        list(MediaListStatus.Planning, 24),
      ]),
    );
    expect(counts[MediaListStatus.Current]).toBe(79);
    expect(counts[MediaListStatus.Planning]).toBe(24);
    expect(counts[MediaListStatus.Paused]).toBe(0);
  });

  it("ignores custom lists, whose entries already sit under a status", () => {
    const counts = toCounts(
      data([list(MediaListStatus.Completed, 10), list(null, 3, true)]),
    );
    expect(counts[MediaListStatus.Completed]).toBe(10);
  });

  it("adds up split lists that share a status", () => {
    const counts = toCounts(
      data([
        list(MediaListStatus.Completed, 4),
        list(MediaListStatus.Completed, 6),
      ]),
    );
    expect(counts[MediaListStatus.Completed]).toBe(10);
  });
});

describe("toCustomLists", () => {
  const withNames = (names: (string | null)[] | null) =>
    ({
      MediaListCollection: {
        lists: [
          { ...list(null, 3, true), name: "List B" },
          { ...list(MediaListStatus.Current, 5), name: "List A" },
        ],
        user: { mediaListOptions: { mangaList: { customLists: names } } },
      },
    }) as MangaListCountsQuery;

  it("keeps the account's order and counts an empty list 0", () => {
    expect(toCustomLists(withNames(["List A", "List B"]))).toEqual([
      { name: "List A", key: "custom:List A", count: 0 },
      { name: "List B", key: "custom:List B", count: 3 },
    ]);
  });

  it("keeps one of a repeated name", () => {
    const names = toCustomLists(withNames(["List A", "List A", null]));
    expect(names?.map((list) => list.name)).toEqual(["List A"]);
  });

  it("is null until loaded", () => {
    expect(toCustomLists(undefined)).toBeNull();
    expect(toCustomLists(withNames(null))).toBeNull();
  });
});
