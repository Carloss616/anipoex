import { describe, expect, it } from "bun:test";
import { bestSource } from "./best-source";

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
      bestSource(sources, {}, { a: probe(40), b: probe(42), c: probe(42) }),
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
      bestSource(sources, { f: { reason: "other", updatedAt: 1 } }, probes),
    ).toBe("d");
  });

  it("picks nothing when no source matched", () => {
    expect(bestSource([src("a")], {}, { a: probe(0, false) })).toBeUndefined();
  });
});
