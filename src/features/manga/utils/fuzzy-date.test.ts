import { describe, expect, it } from "bun:test";
import { fromFuzzyDate, toFuzzyDate } from "./fuzzy-date";

describe("fromFuzzyDate", () => {
  it("builds a local-midnight date from a complete fuzzy date", () => {
    const date = fromFuzzyDate({ year: 2025, month: 3, day: 4 });

    expect(date?.getFullYear()).toBe(2025);
    expect(date?.getMonth()).toBe(2);
    expect(date?.getDate()).toBe(4);
    expect(date?.getHours()).toBe(0);
  });

  it("is undefined when any part is missing", () => {
    expect(fromFuzzyDate({ year: 2025, month: 3, day: null })).toBeUndefined();
    expect(
      fromFuzzyDate({ year: null, month: null, day: null }),
    ).toBeUndefined();
    expect(fromFuzzyDate(null)).toBeUndefined();
    expect(fromFuzzyDate(undefined)).toBeUndefined();
  });
});

describe("toFuzzyDate", () => {
  it("splits a date into 1-based month and day", () => {
    expect(toFuzzyDate(new Date(2025, 2, 4))).toEqual({
      year: 2025,
      month: 3,
      day: 4,
    });
  });

  it("erases the date with an explicit null triple", () => {
    expect(toFuzzyDate(undefined)).toEqual({
      year: null,
      month: null,
      day: null,
    });
  });
});
