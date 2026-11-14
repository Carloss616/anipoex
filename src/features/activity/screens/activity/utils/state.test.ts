import { describe, expect, test } from "bun:test";
import { corners } from "./state";

describe("corners", () => {
  test("keeps only the first, middle, last or only row's place", () => {
    expect(corners(0, 1)).toEqual({ index: 0, count: 1 });
    expect(corners(0, 5)).toEqual({ index: 0, count: 2 });
    expect(corners(2, 5)).toEqual({ index: 1, count: 3 });
    expect(corners(3, 5)).toEqual({ index: 1, count: 3 });
    expect(corners(4, 5)).toEqual({ index: 1, count: 2 });
  });
});
