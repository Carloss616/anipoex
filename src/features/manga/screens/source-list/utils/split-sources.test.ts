import { describe, expect, it } from "bun:test";
import { bestSource } from "@/features/manga/utils/best-source";
import type { ProbeMap } from "@/features/manga/utils/msu";
import type { Source } from "@/features/manga/utils/source";
import {
  applyOrder,
  byTitleResults,
  splitSources,
  titleGroup,
} from "./split-sources";

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
const NONE = { challenged: {}, languages: [] };
const ids = (rows: { source: Source }[]) => rows.map((r) => r.source.id);

describe("splitSources", () => {
  it("sorts available by latest, then name", () => {
    const { available } = splitSources(
      [src("d"), src("c"), src("b"), src("a")],
      {},
      {},
      probes({ a: 10, b: 30, c: 30 }),
      "",
      NONE,
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
      NONE,
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
      NONE,
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
      NONE,
    );
    expect(ids(available)).toEqual(["a"]);
    expect(excluded).toEqual([]);
  });

  const mangaLect = probes({ ml: 252, a: 18, b: 18, c: 18, d: 18, e: 18 });
  const six = ["ml", "a", "b", "c", "d", "e"].map((id) => src(id));

  it("flags the MangaLect case", () => {
    const { available } = splitSources(six, {}, {}, mangaLect, "", NONE);
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
      NONE,
    );
    expect(available.some((r) => r.suspicious)).toBe(false);
  });

  it("the query doesn't change flags", () => {
    const { available } = splitSources(six, {}, {}, mangaLect, "ml", NONE);
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
      NONE,
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

describe("excluded order", () => {
  it("groups excluded sources by reason, behind first, then by name", () => {
    const why = (reason: string) => ({ reason, updatedAt: 1 }) as never;
    const { excluded } = splitSources(
      [src("e"), src("d"), src("c"), src("b"), src("a")],
      {
        a: why("other"),
        b: why("error-found"),
        c: why("not-matched"),
        d: why("outdated"),
        e: why("not-matched"),
      },
      {},
      {},
      "",
      NONE,
    );
    expect(ids(excluded)).toEqual(["d", "c", "e", "b", "a"]);
  });

  it("lists sources by name before any scan", () => {
    const { available } = splitSources(
      [src("b"), src("c"), src("a")],
      {},
      {},
      {},
      "",
      NONE,
    );
    expect(ids(available)).toEqual(["a", "b", "c"]);
  });
});

describe("title search order", () => {
  const rail = (status: "loading" | "done" | "error", results = 0) => ({
    status,
    mangas: Array.from({ length: results }, (_, i) => ({
      url: `/${i}`,
      title: `${i}`,
      thumbnailUrl: null,
    })),
    page: 1,
    hasNextPage: false,
    loadingMore: false,
  });

  it("ranks results, then searching, then empty or failed, then not searched", () => {
    expect(
      [
        rail("done", 2),
        rail("loading"),
        rail("done"),
        rail("error"),
        undefined,
      ].map(titleGroup),
    ).toEqual([0, 1, 2, 2, 3]);
  });

  it("lists sources with title results first, keeping the order within each group", () => {
    const rows = ["a", "b", "c", "d"].map((id) => ({ source: src(id) }));
    const groups: Record<string, number> = { a: 2, b: 0, c: 3, d: 0 };
    expect(ids(byTitleResults(rows, (id) => groups[id]))).toEqual([
      "b",
      "d",
      "a",
      "c",
    ]);
  });

  it("keeps the order when nothing searches", () => {
    const rows = ["c", "a", "b"].map((id) => ({ source: src(id) }));
    expect(ids(byTitleResults(rows, () => 3))).toEqual(["c", "a", "b"]);
  });
});

describe("splitSources and bestSource", () => {
  it("agree on the first matched row", () => {
    const sources = [src("a", "Alpha"), src("b", "Beta"), src("c", "Gamma")];
    const scanned = probes({ a: 42, b: 42.4, c: 41 });
    const prefs = { challenged: { b: 1 }, languages: [] };
    const { available } = splitSources(sources, {}, {}, scanned, "", prefs);
    expect(bestSource(sources, {}, scanned, prefs)).toBe("a");
    expect(available[0].source.id).toBe("a");
  });
});
