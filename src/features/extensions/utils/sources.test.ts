import { describe, expect, it } from "bun:test";
import type { InstalledExtension } from "../runtime";
import { hasSource, toSources } from "./sources";

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
  sources: sources.map(([id, lang]) => ({ id, name, lang, homeUrl: null })),
});

describe("toSources", () => {
  const dex = ext("Example", [
    ["1", "en"],
    ["2", "es-419"],
    ["3", "ja"],
  ]);

  it("lists every language, with the language in the name", () => {
    expect(toSources([dex])).toEqual([
      { id: "1", name: "Example (EN)", initials: "EX" },
      { id: "2", name: "Example (ES-419)", initials: "EX" },
      { id: "3", name: "Example (JA)", initials: "EX" },
    ]);
  });

  it("keeps a single source's name as is, whatever its language", () => {
    const single = ext("Single", [["9", "es"]]);
    expect(toSources([single])).toEqual([
      { id: "9", name: "Single", initials: "SI" },
    ]);
  });

  it("carries the installed icon", () => {
    const icon = "file:///exts/pkg.png";
    expect(toSources([{ ...dex, icon }])[0].iconUrl).toBe(icon);
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
