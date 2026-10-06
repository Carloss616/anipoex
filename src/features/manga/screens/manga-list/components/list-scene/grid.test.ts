import { describe, expect, it } from "bun:test";
import { cellWidth, toRows } from "./grid";

describe("toRows", () => {
  it("chunks into rows, the last one short", () => {
    expect(toRows([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("is empty with no items", () => {
    expect(toRows([], 4)).toEqual([]);
  });
});

describe("cellWidth", () => {
  it("leaves room for the gaps between columns", () => {
    expect(cellWidth(100, 4, 4)).toBe(22);
  });
});
