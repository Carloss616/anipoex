import { describe, expect, it } from "bun:test";
import type { SourceChapter } from "@/features/extensions";
import type { ReadingPosition } from "@/features/manga/state/reading-positions";
import type { StoredChapters } from "@/features/manga/utils/chapter-storage/chapter-storage";
import { continueItems } from "./continue-items";

const chapter = (number: number, dateUpload: number): SourceChapter => ({
  url: `/c${number}`,
  name: `Chapter ${number}`,
  number,
  scanlator: null,
  dateUpload,
  memo: null,
});

// Sources list newest first.
const stored = (url: string, numbers: number[], day = 0): StoredChapters => ({
  manga: { url, title: "Example" },
  chapters: numbers
    .toReversed()
    .map((number) => chapter(number, (day + number) * 86_400_000)),
});

const match = (url: string) => ({
  sourceId: "source-1",
  manga: { url, title: "Example" },
});

describe("continueItems", () => {
  const at = (number: number): ReadingPosition => ({
    sourceId: "source-1",
    chapterId: `/c${number}`,
    number,
    scanlator: null,
    page: 5,
    pages: 20,
    offset: 0,
    readAt: 1,
  });

  it("continues from a saved position", () => {
    const items = continueItems({
      matches: { 1: match("/m1") },
      stored: { 1: stored("/m1", [9, 10, 11, 12, 13]) },
      progress: { 1: 9 },
      positions: { 1: at(12) },
    });
    expect(items[0].next.number).toBe(12);
  });

  it("lists a manga started only by a position", () => {
    const items = continueItems({
      matches: { 1: match("/m1") },
      stored: { 1: stored("/m1", [1, 2]) },
      progress: { 1: 0 },
      positions: { 1: at(1) },
    });
    expect(items.map((item) => item.next.number)).toEqual([1]);
  });

  it("ignores a position its progress already read", () => {
    const items = continueItems({
      matches: { 1: match("/m1") },
      stored: { 1: stored("/m1", [11, 12, 13]) },
      progress: { 1: 12 },
      positions: { 1: at(12) },
    });
    expect(items[0].next.number).toBe(13);
  });

  it("includes a manga with chapters past its progress", () => {
    const items = continueItems({
      matches: { 1: match("/m1") },
      stored: { 1: stored("/m1", [9, 10, 11, 12]) },
      progress: { 1: 10 },
    });
    expect(items).toHaveLength(1);
    expect(items[0].mangaId).toBe(1);
    expect(items[0].unread).toBe(2);
    expect(items[0].next.number).toBe(11);
    expect(items[0].latest).toBe(12 * 86_400_000);
  });

  it("excludes a manga without a found match", () => {
    const list = stored("/m1", [9, 10, 11]);
    expect(
      continueItems({
        matches: {
          1: undefined,
          2: { sourceId: "source-1", manga: null },
          3: { sourceId: "source-1" },
        },
        stored: { 1: list, 2: list, 3: list },
        progress: { 1: 5, 2: 5, 3: 5 },
      }),
    ).toEqual([]);
  });

  it("excludes a stored list of another page", () => {
    expect(
      continueItems({
        matches: { 1: match("/new") },
        stored: { 1: stored("/old", [9, 10, 11]) },
        progress: { 1: 5 },
      }),
    ).toEqual([]);
  });

  it("excludes mangas off the list, unstarted or caught up", () => {
    expect(
      continueItems({
        matches: { 1: match("/m"), 2: match("/m"), 3: match("/m") },
        stored: {
          1: stored("/m", [1, 2]),
          2: stored("/m", [1, 2]),
          3: stored("/m", [1, 2]),
        },
        progress: { 1: undefined, 2: 0, 3: 2 },
      }),
    ).toEqual([]);
  });

  it("sorts by the newest chapter, newest first", () => {
    const items = continueItems({
      matches: { 1: match("/a"), 2: match("/b") },
      stored: { 1: stored("/a", [1, 2]), 2: stored("/b", [1, 2], 100) },
      progress: { 1: 1, 2: 1 },
    });
    expect(items.map((item) => item.mangaId)).toEqual([2, 1]);
  });
});
