import { describe, expect, test } from "bun:test";
import { countUnsynced } from "./unsynced";

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
