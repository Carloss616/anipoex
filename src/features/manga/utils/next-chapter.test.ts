import { describe, expect, it } from "bun:test";
import { continueChapter, nextChapter } from "./next-chapter";
import type { Chapter } from "./to-chapters";

const row = (number: number, scanlator: string | null = null): Chapter => ({
  id: `/c/${number}/${scanlator}`,
  number,
  title: "",
  date: "",
  scanlator,
  memo: null,
});

const c15 = row(15);
const c14b = row(14, "B");
const c14a = row(14, "A");
const c135 = row(13.5);
const c13 = row(13, "A");
const none = row(-1);
const c12 = row(12);
const list = [c15, c14b, c14a, c135, c13, none, c12];

describe("nextChapter", () => {
  it("takes the smallest higher number", () => {
    expect(nextChapter(list, c13)).toBe(c135);
  });

  it("prefers the same scanlator on a tie", () => {
    expect(nextChapter(list, row(13.5, "A"))).toBe(c14a);
  });

  it("takes the first listed on a tie without a scanlator match", () => {
    expect(nextChapter(list, c135)).toBe(c14b);
  });

  it("is undefined after the last chapter", () => {
    expect(nextChapter(list, c15)).toBeUndefined();
  });

  it("takes the newer neighbour of an unnumbered row", () => {
    expect(nextChapter(list, none)).toBe(c13);
    expect(nextChapter([none, c12], none)).toBeUndefined();
  });

  it("skips unnumbered rows", () => {
    expect(nextChapter(list, c12)).toBe(c13);
  });
});

/** Rows from the most to the least recent, as `toChapters` gives them. */
const rows = (...numbers: number[]): Chapter[] =>
  numbers.map((number, i) => ({ ...row(number), id: `u${i}` }));

describe("continueChapter", () => {
  it("is the lowest number past the progress", () => {
    expect(continueChapter(rows(60, 59, 58, 57), 57)?.number).toBe(58);
  });

  it("starts at the lowest number without progress", () => {
    expect(continueChapter(rows(3, 2, 1), 0)?.number).toBe(1);
  });

  it("counts decimals", () => {
    expect(continueChapter(rows(11, 10.5, 10), 10)?.number).toBe(10.5);
  });

  it("is none once everything is read", () => {
    expect(continueChapter(rows(5, 4), 5)).toBeUndefined();
  });

  it("never picks an unnumbered row once reading", () => {
    expect(continueChapter(rows(-1, -1), 3)).toBeUndefined();
  });

  it("starts at the oldest row when none is numbered", () => {
    expect(continueChapter(rows(-1, -1, -1), 0)?.id).toBe("u2");
  });

  it("takes the first listed of a repeated number, like nextChapter", () => {
    expect(continueChapter(rows(59, 58, 58), 57)?.id).toBe("u1");
  });

  it("is none for an empty list", () => {
    expect(continueChapter([], 0)).toBeUndefined();
  });
});
