import { describe, expect, it } from "bun:test";
import type { InstalledExtension } from "../runtime";
import {
  baseLang,
  isMulti,
  languagePriority,
  offered,
  singleLanguages,
} from "./languages";

const ext = (pkg: string, langs: string[]): InstalledExtension => ({
  pkg,
  name: pkg,
  version: "1",
  lib: 1,
  signingKey: "k",
  icon: null,
  sources: langs.map((lang, i) => ({
    id: `${pkg}-${i}`,
    name: pkg,
    lang,
    homeUrl: null,
    headers: {},
  })),
});

describe("baseLang", () => {
  it("drops the region and lowercases", () => {
    expect(baseLang("es-419")).toBe("es");
    expect(baseLang("pt-BR")).toBe("pt");
    expect(baseLang("EN")).toBe("en");
  });
});

describe("isMulti", () => {
  it("is true for several languages or an all-languages source", () => {
    expect(isMulti(ext("a", ["es", "en"]))).toBe(true);
    expect(isMulti(ext("b", ["all"]))).toBe(true);
    expect(isMulti(ext("c", ["mul"]))).toBe(true);
  });

  it("is false for one language, region included", () => {
    expect(isMulti(ext("d", ["es-419"]))).toBe(false);
  });
});

describe("singleLanguages", () => {
  it("lists the base languages of single-language extensions once, sorted", () => {
    const installed = [
      ext("multi", ["fr", "de"]),
      ext("one", ["es-419"]),
      ext("two", ["en"]),
      ext("three", ["es"]),
    ];
    expect(singleLanguages(installed)).toEqual(["en", "es"]);
  });
});

describe("languagePriority", () => {
  it("puts the system language first, then the rest alphabetically", () => {
    expect(languagePriority([], ["en", "es"], "es")).toEqual(["es", "en"]);
  });

  it("keeps the stored order and appends newly installed languages", () => {
    expect(languagePriority(["en", "es"], ["en", "es", "fr"], "es")).toEqual([
      "en",
      "es",
      "fr",
    ]);
  });

  it("drops stored languages that are no longer installed", () => {
    expect(languagePriority(["ko", "en"], ["en"], "es")).toEqual(["en"]);
  });
});

describe("offered", () => {
  it("matches a multi source by base language, region on either side", () => {
    expect(offered("es", ["es"])).toBe(true);
    expect(offered("es-419", ["es"])).toBe(true);
    expect(offered("fr", ["es"])).toBe(false);
  });

  it("always offers an all-languages source, and everything with no list", () => {
    expect(offered("all", ["es"])).toBe(true);
    expect(offered("fr", [])).toBe(true);
  });
});
