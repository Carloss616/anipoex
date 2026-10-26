import { describe, expect, it } from "bun:test";
import { nextGridIndex, nextIndex } from "./utils";

describe("nextIndex", () => {
  it("wraps from the last item to the first, and back", () => {
    expect(nextIndex(2, 3, "ArrowDown", "vertical")).toBe(0);
    expect(nextIndex(0, 3, "ArrowUp", "vertical")).toBe(2);
  });

  it("moves along the group's own axis only", () => {
    expect(nextIndex(1, 3, "ArrowRight", "horizontal")).toBe(2);
    expect(nextIndex(1, 3, "ArrowDown", "horizontal")).toBeNull();
  });

  it("jumps to the ends with Home and End", () => {
    expect(nextIndex(1, 3, "Home", "vertical")).toBe(0);
    expect(nextIndex(1, 3, "End", "horizontal")).toBe(2);
  });

  it("ignores other keys and empty groups", () => {
    expect(nextIndex(1, 3, "a", "vertical")).toBeNull();
    expect(nextIndex(-1, 0, "ArrowDown", "vertical")).toBeNull();
  });
});

describe("nextGridIndex", () => {
  it("moves a row with up and down, a cell with left and right", () => {
    expect(nextGridIndex(5, 12, "ArrowDown", 4)).toBe(9);
    expect(nextGridIndex(5, 12, "ArrowUp", 4)).toBe(1);
    expect(nextGridIndex(5, 12, "ArrowRight", 4)).toBe(6);
    expect(nextGridIndex(4, 12, "ArrowLeft", 4)).toBe(3);
  });

  it("stops at the edges instead of wrapping", () => {
    expect(nextGridIndex(1, 12, "ArrowUp", 4)).toBeNull();
    expect(nextGridIndex(9, 10, "ArrowDown", 4)).toBeNull();
    expect(nextGridIndex(0, 12, "ArrowLeft", 4)).toBeNull();
    expect(nextGridIndex(11, 12, "ArrowRight", 4)).toBeNull();
  });

  it("jumps to the ends with Home and End", () => {
    expect(nextGridIndex(5, 12, "Home", 4)).toBe(0);
    expect(nextGridIndex(5, 12, "End", 4)).toBe(11);
  });
});
