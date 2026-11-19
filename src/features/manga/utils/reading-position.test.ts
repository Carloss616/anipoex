import { describe, expect, it } from "bun:test";
import type { ReadingPosition } from "../state/reading-positions";
import {
  deadPosition,
  livePosition,
  pageLabel,
  resolvePosition,
} from "./reading-position";
import type { Chapter } from "./to-chapters";

const position: ReadingPosition = {
  sourceId: "source-1",
  chapterId: "/ch-10",
  number: 10,
  scanlator: "Group B",
  page: 8,
  pages: 40,
  offset: 0.4,
  readAt: 1,
};

const chapter = (
  id: string,
  number: number,
  scanlator: string | null = null,
): Chapter => ({ id, number, title: id, date: "", scanlator, memo: null });

describe("livePosition", () => {
  it("drops a read chapter", () => {
    expect(livePosition(position, 10)).toBeUndefined();
    expect(livePosition(position, 9)).toBe(position);
    expect(livePosition(position, 0)).toBe(position);
  });

  it("keeps unnumbered", () => {
    const unnumbered = { ...position, number: -1 };
    expect(livePosition(unnumbered, 50)).toBe(unnumbered);
  });

  it("drops an unlisted manga at the end of its last page", () => {
    const end = { ...position, page: 40, offset: 0.95 };
    expect(livePosition(end, null)).toBeUndefined();
  });

  it("keeps an unlisted manga still reading its last page", () => {
    // A one-page strip is on its last page from the first scroll.
    const strip = { ...position, page: 1, pages: 1, offset: 0.3 };
    expect(livePosition(strip, null)).toBe(strip);
  });

  it("keeps an unlisted manga mid-chapter", () => {
    const mid = { ...position, page: 39 };
    expect(livePosition(mid, null)).toBe(mid);
  });

  it("is undefined without a position", () => {
    expect(livePosition(undefined, 3)).toBeUndefined();
  });
});

describe("resolvePosition", () => {
  const chapters = [chapter("/ch-11", 11), chapter("/ch-10", 10, "Group B")];

  it("keeps the page on the same source and url", () => {
    expect(resolvePosition(position, "source-1", chapters)).toEqual({
      chapter: chapters[1],
      page: 8,
      offset: 0.4,
    });
  });

  it("starts at page 1 on another source", () => {
    const other = [chapter("/x-10", 10)];
    expect(resolvePosition(position, "source-2", other)).toEqual({
      chapter: other[0],
      page: 1,
      offset: 0,
    });
  });

  it("starts at page 1 when the source moved the chapter", () => {
    const moved = [chapter("/new-10", 10)];
    expect(resolvePosition(position, "source-1", moved)?.page).toBe(1);
  });

  it("prefers the same scanlator", () => {
    const both = [chapter("/a", 10, "Group A"), chapter("/b", 10, "Group B")];
    expect(resolvePosition(position, "source-2", both)?.chapter.id).toBe("/b");
  });

  it("takes the first listed without that scanlator", () => {
    const both = [chapter("/a", 10, "Group A"), chapter("/c", 10, "Group C")];
    expect(resolvePosition(position, "source-2", both)?.chapter.id).toBe("/a");
  });

  it("is undefined when the number is missing", () => {
    expect(
      resolvePosition(position, "source-2", [chapter("/x", 9)]),
    ).toBeUndefined();
  });

  it("is undefined for an unnumbered chapter elsewhere", () => {
    const unnumbered = { ...position, number: -1 };
    expect(
      resolvePosition(unnumbered, "source-2", [chapter("/x", -1)]),
    ).toBeUndefined();
  });
});

describe("pageLabel", () => {
  it("names the page only on the exact chapter", () => {
    expect(pageLabel(position, "source-1", "/ch-10")).toBe("Page 8 of 40");
    expect(pageLabel(position, "source-2", "/ch-10")).toBeUndefined();
    expect(pageLabel(position, "source-1", "/ch-11")).toBeUndefined();
  });
});

describe("deadPosition", () => {
  it("keeps a manga missing from the cache", () => {
    expect(deadPosition(position, undefined)).toBe(false);
  });

  it("drops a chapter its progress read", () => {
    expect(deadPosition(position, 10)).toBe(true);
    expect(deadPosition(position, 9)).toBe(false);
  });

  it("drops an unlisted manga's finished chapter", () => {
    expect(deadPosition({ ...position, page: 40, offset: 0.95 }, null)).toBe(
      true,
    );
    expect(deadPosition({ ...position, page: 40 }, null)).toBe(false);
  });
});
