import { describe, expect, it } from "bun:test";
import { LIST } from "./fixtures";
import { headerIndices, toRows, toSections } from "./sections";

const all = { filter: "all", language: undefined, search: "" } as const;

const ids = (sections: ReturnType<typeof toSections>) =>
  sections.map((s) => [s.key, s.data.map((e) => e.id)]);

describe("toSections", () => {
  it("shows installed (updates first) then available", () => {
    expect(ids(toSections(LIST, all))).toEqual([
      ["installed", ["asura", "comick", "mangadex"]],
      ["available", ["flame", "kakao"]],
    ]);
  });

  it("keeps only installed for the installed filter", () => {
    expect(ids(toSections(LIST, { ...all, filter: "installed" }))).toEqual([
      ["installed", ["asura", "comick", "mangadex"]],
    ]);
  });

  it("keeps only pending updates for the updates filter", () => {
    expect(ids(toSections(LIST, { ...all, filter: "updates" }))).toEqual([
      ["updates", ["asura", "comick"]],
    ]);
  });

  it("filters by language", () => {
    expect(ids(toSections(LIST, { ...all, language: "Multi" }))).toEqual([
      ["installed", ["comick", "mangadex"]],
    ]);
  });

  it("searches case-insensitively and ignores surrounding spaces", () => {
    expect(ids(toSections(LIST, { ...all, search: "  MANGA " }))).toEqual([
      ["installed", ["mangadex"]],
    ]);
  });

  it("drops sections left empty so no bare header renders", () => {
    expect(toSections(LIST, { ...all, search: "nothing" })).toEqual([]);
    const done = LIST.map((e) => ({ ...e, latestVersion: undefined }));
    expect(toSections(done, { ...all, filter: "updates" })).toEqual([]);
  });
});

describe("toRows", () => {
  it("puts each section's header before its extensions", () => {
    const rows = toRows(toSections(LIST, all));
    expect(rows.map((r) => r.key)).toEqual([
      "header-installed",
      "asura",
      "comick",
      "mangadex",
      "header-available",
      "flame",
      "kakao",
    ]);
  });

  it("divides every extension row but the first of its section", () => {
    // The divider sits above a row, so a header never gets one under it.
    const rows = toRows(toSections(LIST, all));
    expect(
      rows.map((r) => (r.kind === "extension" ? r.divided : null)),
    ).toEqual([null, false, true, true, null, false, true]);
  });

  it("carries the section on its header row", () => {
    const [header] = toRows(toSections(LIST, all));
    expect(header.kind === "header" && header.section.title).toBe("Installed");
  });

  it("is empty when no section is", () => {
    expect(toRows([])).toEqual([]);
  });
});

describe("headerIndices", () => {
  it("points at the header rows, for sticky headers", () => {
    expect(headerIndices(toRows(toSections(LIST, all)))).toEqual([0, 4]);
  });
});
