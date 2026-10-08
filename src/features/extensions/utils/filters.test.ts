import { describe, expect, it } from "bun:test";
import {
  filterLabel,
  languagesOf,
  parseFilter,
  parseLanguage,
} from "./filters";
import { EN, KO, LIST, MULTI } from "./fixtures";

describe("parseFilter", () => {
  it("accepts every filter", () => {
    expect(parseFilter("installed")).toBe("installed");
    expect(parseFilter("available")).toBe("available");
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
    expect(parseLanguage("ko", known)).toBe("ko");
  });

  it("drops unknown or empty values to mean every language", () => {
    expect(parseLanguage("tlh", known)).toBeUndefined();
    // A name is not a code.
    expect(parseLanguage("Korean", known)).toBeUndefined();
    expect(parseLanguage("", known)).toBeUndefined();
    expect(parseLanguage(undefined, known)).toBeUndefined();
  });
});

describe("languagesOf", () => {
  it("lists each language once, sorted by name", () => {
    expect(languagesOf(LIST)).toEqual([EN, KO, MULTI]);
  });
});

describe("filterLabel", () => {
  it("adds the count only when there is one", () => {
    const counts = { all: 5, installed: 3, available: 2, updates: 0 };
    expect(filterLabel("all", counts)).toBe("All · 5");
    expect(filterLabel("installed", counts)).toBe("Installed · 3");
    expect(filterLabel("available", counts)).toBe("Available · 2");
    expect(filterLabel("updates", counts)).toBe("Updates");
  });
});
