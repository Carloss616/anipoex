import { beforeEach, describe, expect, it, mock } from "bun:test";

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

const { clearSearchHistory, matchingHistory, rememberSearch, searchHistory$ } =
  await import("./search-history");

beforeEach(() => clearSearchHistory());

describe("rememberSearch", () => {
  it("dedupes ignoring case, keeping the newest spelling first", () => {
    rememberSearch("Frieren");
    rememberSearch("Solo Leveling");
    rememberSearch("frieren");
    expect(searchHistory$.get()).toEqual(["frieren", "Solo Leveling"]);
  });

  it("ignores blank input and trims", () => {
    rememberSearch("");
    rememberSearch("   ");
    rememberSearch("  Berserk ");
    expect(searchHistory$.get()).toEqual(["Berserk"]);
  });

  it("keeps at most 10 entries", () => {
    for (let i = 0; i < 12; i++) rememberSearch(`q${i}`);
    expect(searchHistory$.get()).toHaveLength(10);
    expect(searchHistory$.get()[0]).toBe("q11");
  });
});

describe("matchingHistory", () => {
  it("keeps entries that contain the draft", () => {
    expect(matchingHistory(["solo leveling", "frieren"], "sol")).toEqual([
      "solo leveling",
    ]);
  });

  it("returns nothing for an empty draft", () => {
    expect(matchingHistory(["frieren"], "")).toEqual([]);
    expect(matchingHistory(["frieren"], "  ")).toEqual([]);
  });
});
