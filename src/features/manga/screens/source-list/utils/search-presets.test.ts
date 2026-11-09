import { describe, expect, it } from "bun:test";
import type { ExcludeReason } from "@/features/manga/utils/msu";
import { presetIds, titleSearchItems } from "./search-presets";

const source = (id: string) => ({ id, name: id, initials: "XX" });
const probe = (matched: boolean, errored = false) => ({
  provider: "x",
  providerName: "x",
  latest: 1,
  count: matched ? 1 : 0,
  matched,
  errored,
  updatedAt: 1,
});
// The sheet's rows carry no probes: they come from the probe lookup.
const available = ["a", "b", "c", "d"].map((id) => ({
  source: source(id),
  suspicious: false,
}));
const probes: Record<string, ReturnType<typeof probe>> = {
  a: probe(true),
  b: probe(false),
  c: probe(false, true),
};
const probeOf = (id: string) => probes[id];
const excludedAs = (id: string, reason: ExcludeReason) => ({
  source: source(id),
  reason,
  pinned: false,
});
const excluded = [
  excludedAs("e", "not-matched"),
  excludedAs("f", "outdated"),
  excludedAs("g", "error-found"),
];
const items = (searching: (id: string) => boolean, start = () => {}) =>
  titleSearchItems(available, excluded, probeOf, searching, start, () => {});

describe("presetIds", () => {
  it("lists unmatched sources without the failed ones", () => {
    expect(presetIds("unmatched", available, excluded, probeOf)).toEqual([
      "b",
      "e",
    ]);
  });

  it("lists every excluded source, and every source for all", () => {
    expect(presetIds("excluded", available, excluded, probeOf)).toEqual([
      "e",
      "f",
      "g",
    ]);
    expect(presetIds("all", available, excluded, probeOf)).toHaveLength(7);
  });
});

describe("titleSearchItems", () => {
  it("offers each preset with its count before searching", () => {
    expect(items(() => false).map((item) => item.label)).toEqual([
      "Search unmatched (2)",
      "Search excluded (3)",
      "Search all (7)",
    ]);
  });

  it("adds a preset to a running search without restarting it", () => {
    const started: string[][] = [];
    const searching = new Set(["b", "f"]);
    const menu = titleSearchItems(
      available,
      excluded,
      probeOf,
      (id) => searching.has(id),
      (ids) => started.push(ids),
      () => {},
    );
    expect(menu.map((item) => item.label)).toEqual([
      "Add unmatched (+1)",
      "Add excluded (+2)",
      "Add all (+5)",
      "Stop searching (2)",
    ]);
    menu[0].onPress?.();
    expect(started).toEqual([["e"]]);
  });

  it("offers only presets that add sources", () => {
    expect(items((id) => id !== "a").map((item) => item.label)).toEqual([
      "Add all (+1)",
      "Stop searching (6)",
    ]);
  });
});
