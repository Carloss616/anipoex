import { describe, expect, it, spyOn } from "bun:test";
import { formatDate } from "./utils";

describe("formatDate", () => {
  it("formats day, short month and year", () => {
    expect(formatDate(new Date(2025, 2, 4), "en-GB")).toBe("4 Mar 2025");
  });

  it("is undefined with no date", () => {
    expect(formatDate(undefined)).toBeUndefined();
  });

  it("keeps an invalid date readable instead of throwing", () => {
    expect(formatDate(new Date(Number.NaN), "en-GB")).toBe("Invalid Date");
  });

  // Hermes builds a formatter on every toLocaleDateString: 134 chapter dates took 76ms on a phone.
  it("builds one formatter per locale, not one per date", () => {
    const spy = spyOn(Intl, "DateTimeFormat");
    for (let day = 1; day <= 50; day++)
      formatDate(new Date(2025, 0, day), "fr-FR");
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
