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

const { clearManual, manualTitles, readManual, setManual } = await import(
  "./manual-matches"
);

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

describe("manualTitles", () => {
  it("lists the titles of the manga's manual matches", () => {
    setManual(1003, "a", { ...mine, title: "Title A" });
    setManual(1003, "b", { ...mine, title: "Title B" });
    setManual(1004, "a", { ...mine, title: "Other manga" });
    expect(manualTitles(1003)).toEqual(["Title A", "Title B"]);
    expect(manualTitles(1003, "a")).toEqual(["Title B"]);
  });

  it("drops a removed manual match", () => {
    setManual(9005, "a", { ...mine, title: "Title A" });
    clearManual(9005, "a");
    expect(manualTitles(9005)).toEqual([]);
  });
});

describe("manualTitles and taken pages", () => {
  it("leaves out pages taken by title, which teach nothing new", () => {
    setManual(1006, "a", { ...mine, title: "Taught", by: "title" });
    setManual(1006, "b", { ...mine, title: "Picked" });
    expect(manualTitles(1006)).toEqual(["Picked"]);
  });
});
