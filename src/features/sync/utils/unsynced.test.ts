import { describe, expect, test } from "bun:test";
import { countUnsynced, formatUnsynced } from "./unsynced";

describe("countUnsynced", () => {
  const stamps = {
    old: { updatedAt: 5 },
    edited: { updatedAt: 20 },
    removed: { updatedAt: 5, deletedAt: 30 },
    quiet: { updatedAt: 40, deletedAt: 50, local: true as const },
    mine: { updatedAt: 60 },
  };

  test("counts what changed after the last sync, removals included", () => {
    expect(countUnsynced(stamps, 10, () => false)).toBe(3);
  });

  test("leaves out local removals and records this device keeps", () => {
    expect(countUnsynced(stamps, 10, (key) => key === "mine")).toBe(2);
  });

  test("nothing after the newest stamp", () => {
    expect(countUnsynced(stamps, 60, () => false)).toBe(0);
  });
});

describe("formatUnsynced", () => {
  test("spells each count in its own plural", () => {
    expect(formatUnsynced({ "manual-matches": 2 })).toBe("2 manual matches");
    expect(formatUnsynced({ matches: 3, settings: 1 })).toBe(
      "1 setting · 3 source picks",
    );
  });

  test("says search history without a number", () => {
    expect(formatUnsynced({ "search-history": 4 })).toBe("search history");
  });

  test("is empty when nothing changed", () => {
    expect(formatUnsynced({ pins: 0 })).toBe("");
  });
});
