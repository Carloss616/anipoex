import { describe, expect, it } from "bun:test";
import { compareSources, type PickPrefs } from "./compare-sources";
import type { ProbeMap } from "./msu";

const probe = (latest: number) => ({
  provider: "x",
  providerName: "x",
  latest,
  count: 1,
  matched: true,
  errored: false,
  updatedAt: 1,
});
const src = (id: string, lang?: string, name = id) => ({ id, name, lang });
const NONE: PickPrefs = { challenged: {}, languages: [] };
const order = (
  sources: ReturnType<typeof src>[],
  probes: ProbeMap,
  prefs: PickPrefs = NONE,
) =>
  [...sources]
    .sort((a, b) => compareSources(a, b, probes, prefs))
    .map(({ id }) => id);

describe("compareSources", () => {
  it("puts more new chapters first", () => {
    expect(order([src("a"), src("b")], { a: probe(40), b: probe(42) })).toEqual(
      ["b", "a"],
    );
  });

  it("takes 42.5 and 42 as the same +N, so the next key decides", () => {
    expect(
      order([src("b"), src("a")], { a: probe(42), b: probe(42.5) }),
    ).toEqual(["a", "b"]);
  });

  it("puts an unchallenged source first on a tie, whatever its language", () => {
    const prefs = { challenged: { es: 1 }, languages: ["es", "en"] };
    expect(
      order(
        [src("es", "es"), src("en", "en")],
        { es: probe(42), en: probe(42) },
        prefs,
      ),
    ).toEqual(["en", "es"]);
  });

  it("orders ties by language priority, by base language, all last", () => {
    const prefs = { challenged: {}, languages: ["es", "en"] };
    const probes = { a: probe(42), b: probe(42), c: probe(42) };
    expect(
      order(
        [src("c", "all"), src("b", "en"), src("a", "es-419")],
        probes,
        prefs,
      ),
    ).toEqual(["a", "b", "c"]);
  });

  it("falls back to the name when everything else ties", () => {
    expect(
      order([src("2", "en", "Beta"), src("1", "en", "Alpha")], {
        1: probe(1),
        2: probe(1),
      }),
    ).toEqual(["1", "2"]);
  });

  it("puts an unscanned source after a scanned one", () => {
    expect(order([src("a"), src("b")], { b: probe(0) })).toEqual(["b", "a"]);
  });
});
