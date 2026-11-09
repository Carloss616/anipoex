import { describe, expect, it } from "bun:test";
import { LIST } from "./fixtures";
import { headerIndices, toRows, toSections } from "./sections";

const all = {
  filter: "all",
  language: "all",
  search: "",
  preferred: [],
} as const;

const ids = (sections: ReturnType<typeof toSections>) =>
  sections.map((s) => [s.key, s.data.map((e) => e.id)]);

describe("toSections", () => {
  it("shows installed (updates first) then available", () => {
    expect(ids(toSections(LIST, all))).toEqual([
      ["installed", ["source-a", "source-b", "source-c"]],
      ["available", ["source-d", "source-e"]],
    ]);
  });

  it("keeps only installed for the installed filter", () => {
    expect(ids(toSections(LIST, { ...all, filter: "installed" }))).toEqual([
      ["installed", ["source-a", "source-b", "source-c"]],
    ]);
  });

  it("keeps only the not-installed for the available filter", () => {
    expect(ids(toSections(LIST, { ...all, filter: "available" }))).toEqual([
      ["available", ["source-d", "source-e"]],
    ]);
  });

  it("keeps only pending updates for the updates filter", () => {
    expect(ids(toSections(LIST, { ...all, filter: "updates" }))).toEqual([
      ["updates", ["source-a", "source-b"]],
    ]);
  });

  it("filters by language", () => {
    expect(ids(toSections(LIST, { ...all, language: "mul" }))).toEqual([
      ["installed", ["source-b", "source-c"]],
    ]);
  });

  it("shows your languages and multi by default, installed untouched", () => {
    const yours = { ...all, language: undefined, preferred: ["en"] };
    expect(ids(toSections(LIST, yours))).toEqual([
      ["installed", ["source-a", "source-b", "source-c"]],
      ["available", ["source-d"]],
    ]);
  });

  it("shows every language for all, and one for its code", () => {
    expect(ids(toSections(LIST, { ...all, filter: "available" }))).toEqual([
      ["available", ["source-d", "source-e"]],
    ]);
    expect(
      ids(toSections(LIST, { ...all, filter: "available", language: "ko" })),
    ).toEqual([["available", ["source-e"]]]);
  });

  it("searches case-insensitively and ignores surrounding spaces", () => {
    expect(ids(toSections(LIST, { ...all, search: "  SOURCE C " }))).toEqual([
      ["installed", ["source-c"]],
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
      "source-a",
      "source-b",
      "source-c",
      "header-available",
      "source-d",
      "source-e",
    ]);
  });

  it("gives each extension row its place in its section", () => {
    const rows = toRows(toSections(LIST, all));
    expect(
      rows.map((r) =>
        r.kind === "extension" ? `${r.index}/${r.count}` : null,
      ),
    ).toEqual([null, "0/3", "1/3", "2/3", null, "0/2", "1/2"]);
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
