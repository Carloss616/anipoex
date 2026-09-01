import { describe, expect, it } from "bun:test";
import { formatDate } from "./utils";

describe("formatDate", () => {
  it("formats day, short month and year", () => {
    expect(formatDate(new Date(2025, 2, 4), "en-GB")).toBe("4 Mar 2025");
  });

  it("is undefined with no date", () => {
    expect(formatDate(undefined)).toBeUndefined();
  });
});
