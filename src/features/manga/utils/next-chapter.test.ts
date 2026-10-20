import { describe, expect, it } from "bun:test";
import { nextChapter } from "./next-chapter";
import type { Chapter } from "./to-chapters";

const row = (number: number, scanlator: string | null = null): Chapter => ({
  id: `/c/${number}/${scanlator}`,
  number,
  title: "",
  date: "",
  scanlator,
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
