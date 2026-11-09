import { describe, expect, it } from "bun:test";
import type { InstalledExtension } from "../runtime";
import { hasSource, toSources, withChosen } from "./sources";

const ext = (
  name: string,
  sources: [string, string][],
): InstalledExtension => ({
  pkg: `pkg.${name}`,
  name,
  version: "1",
  lib: 1,
  signingKey: "k",
  icon: null,
  sources: sources.map(([id, lang]) => ({
    id,
    name,
    lang,
    homeUrl: null,
    headers: {},
  })),
});

describe("toSources", () => {
  const dex = ext("Example", [
    ["1", "en"],
    ["2", "es-419"],
    ["3", "ja"],
  ]);

  it("lists every language, with the language in the name", () => {
    expect(toSources([dex])).toEqual([
      {
        id: "1",
        name: "Example (EN)",
        baseName: "Example",
        lang: "en",
        initials: "EX",
        headers: {},
      },
      {
        id: "2",
        name: "Example (ES-419)",
        baseName: "Example",
        lang: "es-419",
        initials: "EX",
        headers: {},
      },
      {
        id: "3",
        name: "Example (JA)",
        baseName: "Example",
        lang: "ja",
        initials: "EX",
        headers: {},
      },
    ]);
  });

  it("keeps a single source's name as is, whatever its language", () => {
    const single = ext("Single", [["9", "es"]]);
    expect(toSources([single])).toEqual([
      {
        id: "9",
        name: "Single",
        baseName: "Single",
        lang: "es",
        initials: "SI",
        headers: {},
      },
    ]);
  });

  it("carries the installed icon", () => {
    const icon = "file:///exts/pkg.png";
    expect(toSources([{ ...dex, icon }])[0].iconUrl).toBe(icon);
  });

  it("carries an http(s) homepage only", () => {
    const withHome = (homeUrl: string) => ({
      ...dex,
      sources: dex.sources.map((s) => ({ ...s, homeUrl })),
    });
    const web = "https://example.com";
    expect(toSources([withHome(web)])[0].homeUrl).toBe(web);
    expect(toSources([withHome("about:blank")])[0]).not.toHaveProperty(
      "homeUrl",
    );
  });
});

describe("toSources with a multi-language extension", () => {
  const multi = ext("Multi", [
    ["m-en", "en"],
    ["m-es", "es"],
    ["m-fr", "fr"],
    ["m-all", "all"],
  ]);
  const spanish = ext("Spanish", [["s-es", "es-419"]]);
  const english = ext("English", [["e-en", "en"]]);
  const ids = (installed: InstalledExtension[], all?: boolean) =>
    toSources(installed, { all }).map(({ id }) => id);

  it("offers only the languages of the single-language extensions", () => {
    expect(ids([multi, spanish, english])).toEqual([
      "m-en",
      "m-es",
      "m-all",
      "s-es",
      "e-en",
    ]);
  });

  it("names a multi source by its unfiltered count", () => {
    const [first] = toSources([multi, english]);
    expect(first.name).toBe("Multi (EN)");
  });

  it("offers everything when only multi extensions are installed", () => {
    expect(ids([multi])).toEqual(["m-en", "m-es", "m-fr", "m-all"]);
  });

  it("offers everything when asked for all", () => {
    expect(ids([multi, english], true)).toEqual([
      "m-en",
      "m-es",
      "m-fr",
      "m-all",
      "e-en",
    ]);
  });
});

describe("withChosen", () => {
  const installed = [
    ext("Multi", [
      ["m-en", "en"],
      ["m-fr", "fr"],
    ]),
    ext("English", [["e-en", "en"]]),
  ];
  const all = toSources(installed, { all: true });
  const shown = toSources(installed);

  it("appends a chosen source the filter hides, once", () => {
    const result = withChosen(shown, all, "m-fr");
    expect(result.map(({ id }) => id)).toEqual(["m-en", "e-en", "m-fr"]);
  });

  it("returns the same list when nothing is hidden", () => {
    expect(withChosen(shown, all, undefined)).toBe(shown);
    expect(withChosen(shown, all, "e-en")).toBe(shown);
    expect(withChosen(shown, all, "gone")).toBe(shown);
  });
});

describe("hasSource", () => {
  it("finds a source of any installed extension, in any language", () => {
    const installed = [ext("A", [["1", "en"]]), ext("B", [["2", "ja"]])];
    expect(hasSource(installed, "2")).toBe(true);
    expect(hasSource(installed, "3")).toBe(false);
    expect(hasSource([], "1")).toBe(false);
  });
});
