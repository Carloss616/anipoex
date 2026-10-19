import { describe, expect, it } from "bun:test";
import type { InstalledExtension } from "../runtime";
import { enabledLanguages, hasSource, toSources } from "./sources";

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
  sources: sources.map(([id, lang]) => ({ id, name, lang })),
});

describe("enabledLanguages", () => {
  it("adds the device language to all and en", () => {
    expect(enabledLanguages("es-MX")).toEqual(["all", "en", "es"]);
  });

  it("does not repeat en", () => {
    expect(enabledLanguages("en-US")).toEqual(["all", "en"]);
  });
});

describe("toSources", () => {
  const dex = ext("Example", [
    ["1", "en"],
    ["2", "es"],
    ["3", "es-419"],
    ["4", "ja"],
  ]);

  it("keeps es-419 under es and drops ja, with the language in the name", () => {
    expect(toSources([dex], ["all", "en", "es"])).toEqual([
      { id: "1", name: "Example (EN)", initials: "EX" },
      { id: "2", name: "Example (ES)", initials: "EX" },
      { id: "3", name: "Example (ES-419)", initials: "EX" },
    ]);
  });

  it("drops the suffix when one source is left", () => {
    const other = ext("Other Site (Comics)", [["9", "all"]]);
    expect(toSources([dex, other], ["all", "en"])).toEqual([
      { id: "1", name: "Example", initials: "EX" },
      { id: "9", name: "Other Site (Comics)", initials: "OS" },
    ]);
  });

  it("carries the installed icon", () => {
    const icon = "file:///exts/pkg.png";
    expect(toSources([{ ...dex, icon }], ["en"])[0].iconUrl).toBe(icon);
  });

  it("matches the language case-insensitively", () => {
    const upper = ext("Upper", [["5", "ES"]]);
    expect(toSources([upper], ["es"])).toEqual([
      { id: "5", name: "Upper", initials: "UP" },
    ]);
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
