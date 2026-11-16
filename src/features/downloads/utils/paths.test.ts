import { describe, expect, test } from "bun:test";
import {
  chapterHash,
  chapterPath,
  downloadKey,
  groupDownloads,
  idOf,
  pageName,
  safeName,
  stageId,
} from "./paths";

describe("chapterHash", () => {
  test("is 8 hex digits and stable", () => {
    expect(chapterHash("https://example.com/c/1")).toMatch(/^[0-9a-f]{8}$/);
    expect(chapterHash("https://example.com/c/1")).toBe(
      chapterHash("https://example.com/c/1"),
    );
  });
});

test("key and stage id", () => {
  expect(downloadKey(21, "1234", "a1b2c3d4")).toBe("21/1234/a1b2c3d4");
  expect(stageId("21/1234/a1b2c3d4")).toBe("21-1234-a1b2c3d4");
});

describe("safeName", () => {
  test("drops forbidden characters and trailing dots", () => {
    expect(safeName("a/b:c*?", "x")).toBe("abc");
    expect(safeName("...", "Chapter 3")).toBe("Chapter 3");
    expect(safeName("A. ", "x")).toBe("A");
    expect(safeName("a\u0000 \n  b\u007f", "x")).toBe("a b");
  });
  test("caps at 120 without a lone high surrogate", () => {
    expect(safeName("a".repeat(300), "x")).toHaveLength(120);
    expect(safeName(`${"a".repeat(119)}😀`, "x")).toBe("a".repeat(119));
  });
});

describe("chapterPath", () => {
  const manga = { id: 21, title: "Title" };
  const source = { id: "1234", name: "Source A" };
  const url = "https://example.com/c/12";
  test("builds the layout", () => {
    expect(
      chapterPath(manga, source, { url, name: "Chapter 12", number: 12 }),
    ).toBe(
      `downloads/Title [21]/Source A [1234]/Chapter 12 [${chapterHash(url)}].cbz`,
    );
  });
  test("falls back for empty names", () => {
    const h = chapterHash(url);
    expect(chapterPath(manga, source, { url, name: "", number: 12 })).toEndWith(
      `/Chapter 12 [${h}].cbz`,
    );
    expect(chapterPath(manga, source, { url, name: "", number: -1 })).toEndWith(
      `/Chapter [${h}].cbz`,
    );
    expect(
      chapterPath(
        { id: 1, title: "?" },
        { id: "s", name: "*" },
        { url, name: "x", number: 1 },
      ),
    ).toStartWith("downloads/Manga [1]/Source [s]/");
  });
});

test("idOf", () => {
  expect(idOf("Cap. 12 [a1b2c3d4].cbz")).toBe("a1b2c3d4");
  expect(idOf("Title [21]")).toBe("21");
  expect(idOf("Cap. 12 [a1b2c3d4] (1).cbz")).toBe("a1b2c3d4");
  expect(idOf("notes.txt")).toBeUndefined();
});

test("pageName", () => {
  expect(pageName(0, 9)).toBe("001");
  expect(pageName(0, 1500)).toBe("0001");
  expect(pageName(999, 1500)).toBe("1000");
});

describe("groupDownloads", () => {
  test("joins a conflict copy to its original, ignores the rest", () => {
    const out = groupDownloads("d", [
      { name: "Cap [a1b2c3d4].cbz", local: true },
      { name: "Cap [a1b2c3d4] (1).CBZ", local: false },
      { name: "Other [ffffffff].cbz", local: true },
      { name: "notes [a1b2c3d4].txt", local: true },
      { name: "plain.cbz", local: true },
    ]);
    expect(out).toEqual([
      {
        hash: "a1b2c3d4",
        paths: ["d/Cap [a1b2c3d4].cbz", "d/Cap [a1b2c3d4] (1).CBZ"],
        local: false,
      },
      { hash: "ffffffff", paths: ["d/Other [ffffffff].cbz"], local: true },
    ]);
  });
});
