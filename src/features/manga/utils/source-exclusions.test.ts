import { describe, expect, it } from "bun:test";
import {
  autoExclude,
  clearAutoExclusions,
  clearExclusions,
  expiredAutoExclusions,
  isLive,
  recheckExclusions,
  toggleExcluded,
} from "./source-exclusions";

const T = 1_000;
const DAY = 86_400_000;
const probe = (
  provider: string,
  latest: number,
  count = latest,
  errored = false,
  updatedAt = 1,
) => ({
  provider,
  providerName: provider,
  latest,
  count,
  matched: count > 0,
  errored,
  updatedAt,
});
const err = (p: string) => probe(p, 0, 0, true);

describe("toggleExcluded", () => {
  it("exclude writes the reason and pins", () => {
    const r = toggleExcluded({}, {}, "md", true, "bad-numbering", T);
    expect(r.excluded.md).toEqual({ reason: "bad-numbering", updatedAt: T });
    expect(r.pinned.md).toEqual({ updatedAt: T });
  });
  it("include tombstones and pins", () => {
    const r = toggleExcluded(
      { md: { reason: "other", updatedAt: 1 } },
      {},
      "md",
      false,
      "other",
      T,
    );
    expect(r.excluded.md).toEqual({
      reason: "other",
      updatedAt: T,
      deletedAt: T,
    });
    expect(isLive(r.excluded.md)).toBe(false);
    expect(r.pinned.md).toEqual({ updatedAt: T });
  });
  it("include with no record only pins", () => {
    const r = toggleExcluded({}, {}, "md", false, "other", T);
    expect(r.excluded).toEqual({});
    expect(r.pinned.md).toEqual({ updatedAt: T });
  });
  it("does not mutate inputs", () => {
    const ex = {};
    toggleExcluded(ex, {}, "md", true, "other", T);
    expect(ex).toEqual({});
  });
});

describe("clearing", () => {
  it("clear tombstones live records only", () => {
    const r = clearExclusions(
      {
        a: { reason: "other", updatedAt: 1 },
        b: { reason: "other", updatedAt: 1, deletedAt: 2 },
      },
      { a: { updatedAt: 1 } },
      T,
    );
    expect(r.excluded.a.deletedAt).toBe(T);
    expect(r.excluded.b).toEqual({
      reason: "other",
      updatedAt: 1,
      deletedAt: 2,
    });
    expect(r.pinned.a.deletedAt).toBe(T);
  });
  it("retry clears only auto exclusions", () => {
    const r = clearAutoExclusions(
      {
        auto: { reason: "outdated", updatedAt: 1 },
        mine: { reason: "other", updatedAt: 1 },
      },
      { mine: { updatedAt: 1 } },
      T,
    );
    expect(r.auto.deletedAt).toBe(T);
    expect(r.mine).toEqual({ reason: "other", updatedAt: 1 });
  });
});

describe("autoExclude", () => {
  it("auto-excludes bad kinds, dated by their probe", () => {
    const r = autoExclude(
      {},
      {},
      {
        far: probe("far", 5),
        none: probe("none", 0),
        err: err("err"),
        ok: probe("ok", 40),
      },
      { err: err("err") },
      30,
      10,
      undefined,
    );
    expect(r).toEqual({
      far: { reason: "outdated", updatedAt: 1 },
      none: { reason: "not-matched", updatedAt: 1 },
      err: { reason: "error-found", updatedAt: 1 },
    });
  });
  it("one error is not enough", () => {
    expect(
      autoExclude({}, {}, { err: err("err") }, {}, 30, 10, undefined),
    ).toEqual({});
    expect(
      autoExclude(
        {},
        {},
        { err: err("err") },
        { err: probe("err", 40) },
        30,
        10,
        undefined,
      ),
    ).toEqual({});
  });
  it("a pinned source is never auto-excluded", () => {
    expect(
      autoExclude(
        {},
        { far: { updatedAt: 1 } },
        { far: probe("far", 5) },
        {},
        30,
        10,
        undefined,
      ),
    ).toEqual({});
  });
  it("a tombstoned pin no longer protects", () => {
    expect(
      autoExclude(
        {},
        { far: { updatedAt: 1, deletedAt: 2 } },
        { far: probe("far", 5) },
        {},
        30,
        10,
        undefined,
      ).far?.reason,
    ).toBe("outdated");
  });
  it("never auto-excludes the kept source", () => {
    expect(
      autoExclude({}, {}, { md: err("md") }, { md: err("md") }, 30, 10, "md"),
    ).toEqual({});
  });
  it("keeps an existing live exclusion", () => {
    const ex = { far: { reason: "other" as const, updatedAt: 9 } };
    expect(
      autoExclude(ex, {}, { far: probe("far", 5) }, {}, 30, 10, undefined),
    ).toEqual(ex);
  });
});

describe("rechecks", () => {
  it("expired auto exclusions skip pinned and fresh ones", () => {
    const ex = {
      old: { reason: "outdated" as const, updatedAt: 0 },
      fresh: { reason: "outdated" as const, updatedAt: 6 * DAY },
      mine: { reason: "other" as const, updatedAt: 0 },
    };
    expect(
      expiredAutoExclusions(ex, { mine: { updatedAt: 0 } }, 7 * DAY, 7),
    ).toEqual(["old"]);
  });
  it("recheck drops a recovered auto-exclusion", () => {
    const r = recheckExclusions(
      { old: { reason: "error-found", updatedAt: 0 } },
      { old: probe("old", 40, 40, false, 9) },
      ["old"],
      30,
      10,
      T,
    );
    expect(r.old).toEqual({
      reason: "error-found",
      updatedAt: T,
      deletedAt: T,
    });
  });
  it("recheck re-dates a still-bad one", () => {
    const r = recheckExclusions(
      { old: { reason: "outdated", updatedAt: 0 } },
      { old: probe("old", 5, 5, false, 9) },
      ["old"],
      30,
      10,
      T,
    );
    expect(r.old).toEqual({ reason: "outdated", updatedAt: 9 });
  });
});
