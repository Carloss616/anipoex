import { describe, expect, it } from "bun:test";
import { toProgress } from "./progress";

describe("toProgress", () => {
  it("names the chapter when the total is unknown", () => {
    expect(toProgress(363, null)).toEqual({
      label: "Ch. 363",
      spoken: "363 chapters read",
      fraction: undefined,
    });
  });

  it("shows read over total, with a fraction for the bar", () => {
    expect(toProgress(176, 266)).toEqual({
      label: "176 / 266",
      spoken: "176 of 266 chapters read",
      fraction: 176 / 266,
    });
  });

  it("treats a missing read count as 0 and a 0 total as unknown", () => {
    expect(toProgress(undefined, 0).label).toBe("Ch. 0");
  });

  it("never draws past a full bar", () => {
    expect(toProgress(120, 100).fraction).toBe(1);
  });
});
