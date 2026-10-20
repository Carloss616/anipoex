import { describe, expect, it } from "bun:test";
import { excludedBadge, excludeReasons, statusDetail } from "./row-content";

describe("row content", () => {
  it("joins chapter and age when present", () => {
    expect(
      statusDetail({ label: "+11", color: "success", chapter: 374, age: "2h" }),
    ).toBe("c.374 · 2h");
    expect(
      statusDetail({
        label: "+234",
        color: "warning",
        chapter: 597,
        suspicious: true,
        age: "3d",
      }),
    ).toBe("c.597? · 3d");
    expect(
      statusDetail({ label: "error", color: "destructive", age: "10m" }),
    ).toBe("10m");
    expect(statusDetail({ label: "not scanned", color: "secondary" })).toBe("");
    expect(
      statusDetail({ label: "+0", color: "warning", chapter: 0, age: "1d" }),
    ).toBe("c.0 · 1d");
  });

  it("puts bad-numbering first when suspicious", () => {
    expect(excludeReasons(false)).toEqual([
      "outdated",
      "bad-numbering",
      "not-matched",
      "error-found",
      "other",
    ]);
    expect(excludeReasons(true)).toEqual([
      "bad-numbering",
      "outdated",
      "not-matched",
      "error-found",
      "other",
    ]);
  });

  it("labels who excluded", () => {
    expect(excludedBadge("outdated", false)).toBe("behind · auto");
    expect(excludedBadge("bad-numbering", true)).toBe("bad numbers · you");
  });
});
