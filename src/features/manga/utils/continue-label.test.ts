import { describe, expect, it } from "bun:test";
import { chapterBadge, continueDescription } from "./continue-label";
import type { Chapter } from "./to-chapters";

const chapter = (number: number): Chapter => ({
  id: `/c/${number}`,
  number,
  title: "",
  date: "",
  scanlator: null,
  memo: null,
});

describe("chapterBadge", () => {
  it("numbers a chapter as c.N", () => {
    expect(chapterBadge(58)).toBe("c.58");
    expect(chapterBadge(10.5)).toBe("c.10.5");
  });

  it("is none for an unnumbered chapter", () => {
    expect(chapterBadge(-1)).toBeUndefined();
    expect(chapterBadge(undefined)).toBeUndefined();
  });
});

describe("continueDescription", () => {
  it("spells out a numbered chapter", () => {
    expect(continueDescription({ chapter: chapter(58) }, "Continue")).toBe(
      "Continue, chapter 58",
    );
  });

  it("leaves an unnumbered chapter out", () => {
    expect(continueDescription({ chapter: chapter(-1) }, "Start reading")).toBe(
      "Start reading",
    );
  });
});
