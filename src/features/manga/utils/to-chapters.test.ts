import { describe, expect, it } from "bun:test";
import type { SourceChapter } from "@/features/extensions";
import { isRead, parseChapterNumber, toChapters } from "./to-chapters";

const chapter = (overrides: Partial<SourceChapter>): SourceChapter => ({
  url: "/c/1",
  name: "Chapter 1",
  number: 1,
  scanlator: null,
  dateUpload: 0,
  memo: null,
  ...overrides,
});

describe("parseChapterNumber", () => {
  it("reads the chapter from its name", () => {
    expect(parseChapterNumber("Ch.4")).toBe(4);
    expect(parseChapterNumber("Chapter 12.5")).toBe(12.5);
    expect(parseChapterNumber("Vol.2 Ch.10")).toBe(10);
  });

  it("is -1 when the name has no chapter", () => {
    expect(parseChapterNumber("Oneshot")).toBe(-1);
  });
});

describe("toChapters", () => {
  it("keeps the source order and uses the url as id", () => {
    const result = toChapters([
      chapter({ url: "/b", number: 2 }),
      chapter({ url: "/a", number: 1 }),
    ]);
    expect(result.map((c) => c.id)).toEqual(["/b", "/a"]);
    expect(result.map((c) => c.number)).toEqual([2, 1]);
  });

  it("falls back to the name when the source gives no number", () => {
    expect(toChapters([chapter({ number: -1, name: "Ch.7" })])[0].number).toBe(
      7,
    );
    expect(
      toChapters([chapter({ number: -1, name: "Oneshot" })])[0].number,
    ).toBe(-1);
  });

  it("rounds the float noise of the source number", () => {
    expect(
      toChapters([chapter({ number: 10.100000381469727 })])[0].number,
    ).toBe(10.1);
  });

  it("leaves the date empty when the source has none", () => {
    expect(toChapters([chapter({ dateUpload: 0 })])[0].date).toBe("");
    expect(
      toChapters([chapter({ dateUpload: 1757635200000 })])[0].date,
    ).not.toBe("");
  });

  it("copies the scanlator", () => {
    expect(toChapters([chapter({ scanlator: "A" })])[0].scanlator).toBe("A");
    expect(toChapters([chapter({ scanlator: null })])[0].scanlator).toBeNull();
  });

  it("titles the row with the source's name", () => {
    expect(toChapters([chapter({ name: "Ch.4 - Hello" })])[0].title).toBe(
      "Ch.4 - Hello",
    );
  });
});

describe("isRead", () => {
  it("never reads a chapter without a number", () => {
    expect(isRead(0, -1)).toBe(false);
    expect(isRead(5, -1)).toBe(false);
  });

  it("reads chapters up to the progress", () => {
    expect(isRead(13, 13)).toBe(true);
    expect(isRead(13, 14)).toBe(false);
    expect(isRead(13, 12.5)).toBe(true);
    expect(isRead(12, 12.5)).toBe(false);
  });

  it("reads nothing at progress 0 but chapter 0 once started", () => {
    expect(isRead(0, 0)).toBe(false);
    expect(isRead(1, 0)).toBe(true);
  });
});
