import { describe, expect, it, mock } from "bun:test";

mock.module("@/state/observable-persist", () => ({
  ObservablePersist: class {
    getTable() {
      return {};
    }
    set() {}
    deleteTable() {}
    getMetadata() {
      return {};
    }
    setMetadata() {}
    deleteMetadata() {}
  },
}));

const { clearManual, readManual, setManual } = await import("./manual-matches");

const mine = { url: "/m", title: "Mine", thumbnailUrl: null };

describe("manual matches", () => {
  it("reads back the page set for a manga and source", () => {
    setManual(1001, "a", mine);
    expect(readManual(1001, "a")).toEqual(mine);
  });

  it("clears one source and leaves the others", () => {
    setManual(1002, "a", mine);
    setManual(1002, "b", { ...mine, url: "/b" });
    clearManual(1002, "a");
    expect(readManual(1002, "a")).toBeUndefined();
    expect(readManual(1002, "b")?.url).toBe("/b");
  });
});
