import { describe, expect, it } from "bun:test";
import { nextIndex } from "./utils";

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
