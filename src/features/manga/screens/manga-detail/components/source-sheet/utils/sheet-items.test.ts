import { describe, expect, it } from "bun:test";
import { sheetItemKey, sheetItems } from "./sheet-items";

const src = (id: string) => ({ id, name: id, initials: "XX" });
const av = (id: string) => ({ source: src(id), suspicious: false });
const ex = (id: string) => ({
  source: src(id),
  reason: "outdated" as const,
  pinned: false,
});
const shape = (items: ReturnType<typeof sheetItems>) =>
  items.map((i) =>
    i.kind === "header"
      ? sheetItemKey(i)
      : `${sheetItemKey(i)}${i.first ? "!" : ""}`,
  );

describe("sheetItems", () => {
  it("is empty when both sections are", () =>
    expect(sheetItems([], [])).toEqual([]));

  it("lists both sections with a first row each", () =>
    expect(shape(sheetItems([av("a"), av("b")], [ex("c")]))).toEqual([
      "header:available",
      "available:a!",
      "available:b",
      "header:excluded",
      "excluded:c!",
    ]));

  it("says no sources when only excluded has rows", () =>
    expect(shape(sheetItems([], [ex("c")]))).toEqual([
      "header:available",
      "header:no-sources",
      "header:excluded",
      "excluded:c!",
    ]));

  it("drops the excluded header when nothing is excluded", () =>
    expect(shape(sheetItems([av("a")], []))).toEqual([
      "header:available",
      "available:a!",
    ]));
});
