import { describe, expect, it } from "bun:test";
import { isListStale } from "./list-stale";

const MIN = 60_000;

describe("isListStale", () => {
  it("is stale when it was never refreshed", () => {
    expect(isListStale(undefined, 15, 0)).toBe(true);
  });

  it("is fresh within the interval", () => {
    expect(isListStale(0, 15, 14 * MIN)).toBe(false);
  });

  it("is stale once the interval has passed", () => {
    expect(isListStale(0, 15, 15 * MIN)).toBe(true);
  });

  it("is stale when the clock went back", () => {
    expect(isListStale(10 * MIN, 15, 0)).toBe(true);
  });
});
