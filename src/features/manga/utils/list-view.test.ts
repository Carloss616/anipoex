import { describe, expect, it } from "bun:test";
import {
  columnOptions,
  columnsFor,
  DEFAULT_DENSITY,
  toTitlePosition,
} from "./list-view";

describe("columnsFor", () => {
  it("uses the breakpoint's default at density 0", () => {
    expect(columnsFor("base", 0)).toBe(3);
    expect(columnsFor("xl", 0)).toBe(7);
  });

  it("nudges one column either way", () => {
    expect(columnsFor("base", -1)).toBe(2);
    expect(columnsFor("base", 1)).toBe(4);
  });

  it("keeps the step, not the number, across breakpoints", () => {
    expect(columnsFor("base", 1)).toBe(4);
    expect(columnsFor("lg", 1)).toBe(7);
  });

  it("falls back to the default density, the most columns, for stale or hand-edited values", () => {
    expect(DEFAULT_DENSITY).toBe(1);
    for (const junk of [5, -3, "1", null, undefined, 0.5]) {
      expect(columnsFor("base", junk)).toBe(4);
    }
  });
});

describe("columnOptions", () => {
  it("offers one fewer, the default and one more, fewest first", () => {
    expect(columnOptions("base")).toEqual([
      { density: -1, columns: 2 },
      { density: 0, columns: 3 },
      { density: 1, columns: 4 },
    ]);
    expect(columnOptions("xl").map((o) => o.columns)).toEqual([6, 7, 8]);
  });
});

describe("toTitlePosition", () => {
  it("only `over` puts the title on the cover", () => {
    expect(toTitlePosition("over")).toBe("over");
    expect(toTitlePosition("below")).toBe("below");
    for (const junk of ["left", "", null, undefined, 1]) {
      expect(toTitlePosition(junk)).toBe("below");
    }
  });
});
