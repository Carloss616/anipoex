import { describe, expect, test } from "bun:test";
import type { Chapter } from "@/features/manga/utils/to-chapters";
import { chapterHash } from "./paths";
import { pickChapters, preferredScanlator } from "./pick-chapters";

const ch = (
  number: number,
  scanlator: string | null = null,
  id = `https://example.com/c/${number}-${scanlator}`,
) =>
  ({
    id,
    number,
    title: `Chapter ${number}`,
    date: "",
    scanlator,
    memo: "",
  }) as Chapter;

const four = ch(4);
const six = ch(6, "Group A");
const sixB = ch(6, "Group B");
const notice = ch(-1, null, "https://example.com/notice");
// Newest first, like a source list.
const chapters = [
  ...[12, 11, 10, 9, 8, 7].map((n) => ch(n)),
  six,
  sixB,
  ch(5),
  four,
  ...[3, 2, 1].map((n) => ch(n)),
  notice,
];
const numbers = (list: Chapter[]) => list.map((c) => c.number);
const none = new Set<string>();

describe("pickChapters", () => {
  test("next picks the first unread", () => {
    expect(numbers(pickChapters(chapters, "next", 3, none, null))).toEqual([4]);
  });

  test("next5 takes a number once", () => {
    expect(numbers(pickChapters(chapters, "next5", 3, none, null))).toEqual([
      4, 5, 6, 7, 8,
    ]);
  });

  test("prefers a scanlator", () => {
    const picked = pickChapters(chapters, "next5", 3, none, "Group B");
    expect(picked.find((c) => c.number === 6)).toBe(sixB);
  });

  test("no preference takes the first in source order", () => {
    const picked = pickChapters(chapters, "next5", 3, none, null);
    expect(picked.find((c) => c.number === 6)).toBe(six);
  });

  test("skips a downloaded number, even one by another scanlator", () => {
    const done = new Set([chapterHash(four.id)]);
    expect(numbers(pickChapters(chapters, "next", 3, done, null))).toEqual([5]);
    const sixDone = new Set([chapterHash(sixB.id)]);
    expect(numbers(pickChapters(chapters, "next5", 3, sixDone, null))).toEqual([
      4, 5, 7, 8, 9,
    ]);
  });

  test("unread", () => {
    expect(numbers(pickChapters(chapters, "unread", 10, none, null))).toEqual([
      11, 12,
    ]);
  });

  test("a fractional chapter above progress is unread", () => {
    const list = [ch(13), ch(12.5), ch(12)];
    expect(numbers(pickChapters(list, "unread", 12, none, null))).toEqual([
      12.5, 13,
    ]);
  });

  test("all includes read and unnumbered; next never picks -1", () => {
    expect(numbers(pickChapters(chapters, "all", 3, none, null))).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, -1,
    ]);
    expect(pickChapters(chapters, "unread", 0, none, null)).not.toContain(
      notice,
    );
  });

  test("all puts unnumbered ones oldest first", () => {
    const a = ch(-1, null, "a");
    const b = ch(-1, null, "b");
    const one = ch(1);
    const ids = pickChapters([a, one, b], "all", 0, none, null).map(
      (c) => c.id,
    );
    expect(ids).toEqual([one.id, "b", "a"]);
  });
});

describe("preferredScanlator", () => {
  test("the highest read or downloaded number wins", () => {
    const list = chapters.map((c) =>
      c.number > 0 && c.number <= 5 ? { ...c, scanlator: "Group A" } : c,
    );
    const done = new Set([chapterHash(sixB.id)]);
    expect(preferredScanlator(list, 5, done)).toBe("Group B");
  });

  test("null when nothing is read or downloaded", () => {
    expect(preferredScanlator(chapters, 0, none)).toBeNull();
  });

  test("a null scanlator on the highest one gives null", () => {
    expect(
      preferredScanlator([ch(2, null), ch(1, "Group A")], 2, none),
    ).toBeNull();
  });
});
