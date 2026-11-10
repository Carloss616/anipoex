import { describe, expect, it } from "bun:test";
import type { ProviderProbe } from "../../msu";
import { markOf, orderMarks, type SourceMark, visibleMarks } from "./marks";

const probe = (p: Partial<ProviderProbe>): ProviderProbe => ({
  provider: "source-1",
  providerName: "Source A",
  latest: 0,
  count: 0,
  matched: false,
  errored: false,
  updatedAt: 0,
  ...p,
});

const mark = (id: string, state: SourceMark["state"], unread?: number) => ({
  id,
  name: id,
  initials: id,
  state,
  unread,
});

describe("markOf", () => {
  it("is an error when the read failed", () => {
    expect(markOf(probe({ errored: true }), 5)).toEqual({ state: "error" });
  });

  it("is nomatch when the source has no entry", () => {
    expect(markOf(probe({}), 5)).toEqual({ state: "nomatch" });
  });

  it("counts the unread chapters when found", () => {
    expect(markOf(probe({ matched: true, latest: 12.5 }), 10)).toEqual({
      state: "found",
      unread: 2,
    });
  });
});

describe("orderMarks", () => {
  it("puts the most unread first, then scanning, pending, error, nomatch", () => {
    const marks = [
      mark("A", "nomatch"),
      mark("B", "pending"),
      mark("C", "found", 0),
      mark("D", "error"),
      mark("E", "scanning"),
      mark("F", "found", 3),
    ];
    expect(orderMarks(marks).map((m) => m.id)).toEqual([
      "F",
      "C",
      "E",
      "B",
      "D",
      "A",
    ]);
  });
});

describe("visibleMarks", () => {
  it("cuts after six and counts the rest", () => {
    const marks = Array.from({ length: 8 }, (_, i) => mark(`s${i}`, "pending"));
    const { shown, more } = visibleMarks(marks);
    expect(shown).toHaveLength(6);
    expect(more).toBe(2);
  });

  it("has no rest when they all fit", () => {
    const marks = [mark("a", "pending"), mark("b", "pending")];
    expect(visibleMarks(marks).more).toBe(0);
  });
});
