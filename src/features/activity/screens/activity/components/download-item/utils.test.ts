import { describe, expect, test } from "bun:test";
import { chapterLabel, downloadLine } from "./utils";

describe("chapterLabel", () => {
  test("prefers the chapter's name, then its number", () => {
    expect(chapterLabel(12, "Ch. 12: The Duel")).toBe("Ch. 12: The Duel");
    expect(chapterLabel(12, "")).toBe("Chapter 12");
    expect(chapterLabel(-1, "")).toBe("Chapter");
  });
});

describe("downloadLine", () => {
  test("shows the chapter and the state", () => {
    expect(downloadLine("Chapter 1", "queued", undefined, false)).toBe(
      "Chapter 1 · Queued",
    );
    expect(downloadLine("Chapter 1", "queued", undefined, true)).toBe(
      "Chapter 1 · Paused",
    );
    expect(downloadLine("Chapter 1", "failed", "Timed out", true)).toBe(
      "Chapter 1 · Timed out",
    );
    expect(downloadLine("Chapter 1", "failed", "", false)).toBe(
      "Chapter 1 · Failed",
    );
  });
});
