import { describe, expect, it } from "bun:test";
import {
  filterLabel,
  languagesOf,
  parseFilter,
  parseLanguage,
} from "./filters";
import { LIST } from "./fixtures";

describe("parseFilter", () => {
  it("accepts the three filters", () => {
    expect(parseFilter("installed")).toBe("installed");
    expect(parseFilter("updates")).toBe("updates");
  });

  it("falls back to all for anything a URL can carry", () => {
    // Deep links and hand-typed URLs reach this unchecked.
    expect(parseFilter(undefined)).toBe("all");
    expect(parseFilter("")).toBe("all");
    expect(parseFilter("Installed")).toBe("all");
    expect(parseFilter("foo")).toBe("all");
  });

  it("reads the first value of a repeated param", () => {
    expect(parseFilter(["updates", "installed"])).toBe("updates");
  });
});

describe("parseLanguage", () => {
  const known = languagesOf(LIST);

  it("keeps a language the registry has", () => {
    expect(parseLanguage("Korean", known)).toBe("Korean");
  });

  it("drops unknown or empty values to mean every language", () => {
    expect(parseLanguage("Klingon", known)).toBeUndefined();
    expect(parseLanguage("", known)).toBeUndefined();
    expect(parseLanguage(undefined, known)).toBeUndefined();
  });
});

describe("languagesOf", () => {
  it("lists each language once, sorted", () => {
    expect(languagesOf(LIST)).toEqual(["English", "Korean", "Multi"]);
  });
});

describe("filterLabel", () => {
  it("adds the count only when there is one", () => {
    const counts = { installed: 3, updates: 0 };
    expect(filterLabel("all", counts)).toBe("All");
    expect(filterLabel("installed", counts)).toBe("Installed 3");
    expect(filterLabel("updates", counts)).toBe("Updates");
  });
});
