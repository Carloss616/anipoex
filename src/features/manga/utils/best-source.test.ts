import { describe, expect, it } from "bun:test";
import { bestSource, nextAutoPick } from "./best-source";
import type { PickPrefs } from "./compare-sources";

const NONE: PickPrefs = { challenged: {}, languages: [] };

const src = (id: string) => ({ id, name: id });
const probe = (latest: number, matched = true, errored = false) => ({
  provider: "x",
  providerName: "x",
  latest,
  count: matched ? 1 : 0,
  matched,
  errored,
  updatedAt: 1,
});

describe("bestSource", () => {
  it("picks the matched source furthest ahead, ties by name", () => {
    const sources = ["c", "b", "a"].map(src);
    expect(
      bestSource(
        sources,
        {},
        { a: probe(40), b: probe(42), c: probe(42) },
        NONE,
      ),
    ).toBe("b");
  });

  it("skips excluded, unmatched, failing and suspicious sources", () => {
    const sources = ["a", "b", "c", "d", "e", "f"].map(src);
    const probes = {
      a: probe(500),
      b: probe(0, false),
      c: probe(0, false, true),
      d: probe(41),
      e: probe(40),
      f: probe(42),
    };
    expect(
      bestSource(
        sources,
        { f: { reason: "other", updatedAt: 1 } },
        probes,
        NONE,
      ),
    ).toBe("d");
  });

  it("picks nothing when no source matched", () => {
    expect(
      bestSource([src("a")], {}, { a: probe(0, false) }, NONE),
    ).toBeUndefined();
  });

  it("takes an unchallenged source over a challenged one on a tie", () => {
    const sources = ["a", "b"].map(src);
    expect(
      bestSource(
        sources,
        {},
        { a: probe(42), b: probe(42) },
        { challenged: { a: 1 }, languages: [] },
      ),
    ).toBe("b");
  });
});

describe("nextAutoPick", () => {
  it("picks when nothing is chosen", () => {
    expect(nextAutoPick(undefined, "a", true)).toBe("a");
  });

  it("replaces an automatic pick with a better one", () => {
    expect(nextAutoPick({ sourceId: "b", auto: true }, "a", true)).toBe("a");
  });

  it("never replaces a pick made by hand", () => {
    expect(nextAutoPick({ sourceId: "b" }, "a", true)).toBeUndefined();
  });

  it("does nothing when the best is already picked", () => {
    expect(
      nextAutoPick({ sourceId: "a", auto: true }, "a", true),
    ).toBeUndefined();
  });

  it("does nothing when auto-pick is off, or nothing qualifies", () => {
    expect(nextAutoPick(undefined, "a", false)).toBeUndefined();
    expect(nextAutoPick(undefined, undefined, true)).toBeUndefined();
  });
});
