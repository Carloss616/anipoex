import { afterEach, describe, expect, it } from "bun:test";
import { observable } from "@legendapp/state";
import type { Stamp } from "./records";
import { applying, watchTable } from "./watch-table";

type Table = Record<string, Record<string, { reason: string }>>;

const setup = (initial: Table = {}) => {
  const table$ = observable<Table>(initial);
  const stamps$ = observable<Record<string, Stamp>>({});
  let now = 100;
  watchTable({ name: "t", obs$: table$, depth: 2 }, stamps$, () => now);
  return { table$, stamps$, tick: (to: number) => (now = to) };
};

afterEach(() => {
  applying.current = false;
});

describe("watchTable", () => {
  it("stamps a record set at its own level", () => {
    const { table$, stamps$ } = setup();

    table$[21]["source-1"].set({ reason: "outdated" });

    expect(stamps$.peek()).toEqual({ "21/source-1": { updatedAt: 100 } });
  });

  it("stamps each record a set above them touched, and a removal", () => {
    const { table$, stamps$ } = setup({
      21: { "source-1": { reason: "a" }, "source-2": { reason: "b" } },
    });

    table$[21].set({
      "source-1": { reason: "a" },
      "source-3": { reason: "c" },
    });

    expect(stamps$.peek()).toEqual({
      "21/source-2": { updatedAt: 100, deletedAt: 100 },
      "21/source-3": { updatedAt: 100 },
    });
  });

  it("stamps a deleted record with a tombstone", () => {
    const { table$, stamps$, tick } = setup({
      21: { "source-1": { reason: "a" } },
    });
    tick(200);

    table$[21]["source-1"].delete();

    expect(stamps$["21/source-1"].peek()).toEqual({
      updatedAt: 200,
      deletedAt: 200,
    });
  });

  it("leaves a sync's own writes unstamped", () => {
    const { table$, stamps$ } = setup();

    applying.current = true;
    table$[21]["source-1"].set({ reason: "outdated" });

    expect(stamps$.peek()).toEqual({});
  });
});
