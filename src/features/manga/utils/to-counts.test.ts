import { describe, expect, it } from "bun:test";
import { MediaListStatus } from "@/graphql/types.generated";
import type { MangaListCountsQuery } from "../graphql/manga-list-counts.generated";
import { toCounts } from "./to-counts";

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
