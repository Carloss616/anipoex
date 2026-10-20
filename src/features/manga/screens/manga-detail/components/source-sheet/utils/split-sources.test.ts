import { describe, expect, it } from "bun:test";
import type { ProbeMap } from "@/features/manga/utils/msu";
import type { Source } from "@/features/manga/utils/source";
import { applyOrder, splitSources } from "./split-sources";

const src = (id: string, name = id): Source => ({ id, name, initials: "XX" });
const probe = (id: string, latest: number, matched = true) => ({
  provider: id,
  providerName: id,
  latest,
  count: matched ? 1 : 0,
  matched,
  errored: false,
  updatedAt: 1,
});
const probes = (latests: Record<string, number>): ProbeMap =>
  Object.fromEntries(
    Object.entries(latests).map(([id, l]) => [id, probe(id, l)]),
  );
const ids = (rows: { source: Source }[]) => rows.map((r) => r.source.id);

describe("splitSources", () => {
  it("sorts available by latest, then name", () => {
    const { available } = splitSources(
      [src("d"), src("c"), src("b"), src("a")],
      {},
      {},
      probes({ a: 10, b: 30, c: 30 }),
      "",
    );
    expect(ids(available)).toEqual(["b", "c", "a", "d"]);
  });

  it("tombstoned exclusions stay available", () => {
    const { available, excluded } = splitSources(
      [src("a")],
      { a: { reason: "other", updatedAt: 1, deletedAt: 2 } },
      {},
      {},
      "",
    );
    expect(ids(available)).toEqual(["a"]);
    expect(excluded).toEqual([]);
  });

  it("filters both sections by the query", () => {
    const { available, excluded } = splitSources(
      [src("1", "Source A"), src("2", "Source B"), src("3", "Other")],
      { "2": { reason: "other", updatedAt: 1 } },
      {},
      {},
      " source ",
    );
    expect(ids(available)).toEqual(["1"]);
    expect(ids(excluded)).toEqual(["2"]);
  });

  it("lists installed sources only", () => {
    const { available, excluded } = splitSources(
      [src("a")],
      { gone: { reason: "other", updatedAt: 1 } },
      {},
      probes({ gone: 5 }),
      "",
    );
    expect(ids(available)).toEqual(["a"]);
    expect(excluded).toEqual([]);
  });

  const mangaLect = probes({ ml: 252, a: 18, b: 18, c: 18, d: 18, e: 18 });
  const six = ["ml", "a", "b", "c", "d", "e"].map((id) => src(id));

  it("flags the MangaLect case", () => {
    const { available } = splitSources(six, {}, {}, mangaLect, "");
    expect(
      available.filter((r) => r.suspicious).map((r) => r.source.id),
    ).toEqual(["ml"]);
    expect(available[5].source.id).toBe("ml");
  });

  it("needs two others to flag", () => {
    const { available } = splitSources(
      [src("a"), src("b")],
      {},
      {},
      probes({ a: 252, b: 18 }),
      "",
    );
    expect(available.some((r) => r.suspicious)).toBe(false);
  });

  it("the query doesn't change flags", () => {
    const { available } = splitSources(six, {}, {}, mangaLect, "ml");
    expect(ids(available)).toEqual(["ml"]);
    expect(available[0].suspicious).toBe(true);
  });

  it("marks manual exclusions", () => {
    const ex = (reason = "other" as const) => ({ reason, updatedAt: 1 });
    const { excluded } = splitSources(
      [src("a"), src("b"), src("c")],
      { a: ex(), b: ex(), c: ex() },
      { a: { updatedAt: 1 }, b: { updatedAt: 1, deletedAt: 2 } },
      {},
      "",
    );
    expect(excluded.map((r) => r.pinned)).toEqual([true, false, false]);
  });
});

describe("applyOrder", () => {
  it("puts ordered ids first and ignores missing ones", () => {
    const rows = ["a", "b", "c"].map((id) => ({ source: src(id) }));
    expect(ids(applyOrder(rows, ["b", "zz", "a"]))).toEqual(["b", "a", "c"]);
  });
});
