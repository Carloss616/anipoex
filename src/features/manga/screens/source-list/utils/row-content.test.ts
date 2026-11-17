import { describe, expect, it, mock } from "bun:test";

// The registry requires native assets; the badges only need a name per icon.
mock.module("@/components/ui/icon", () => ({
  Icons: new Proxy({}, { get: (_, name) => String(name) }),
}));

const {
  excludedBy,
  excludedMenuItems,
  excludeReasons,
  statusBadges,
  statusDetail,
} = await import("./row-content");

describe("row content", () => {
  it("splits chapter and age, each when present", () => {
    expect(
      statusDetail({ label: "+11", color: "success", chapter: 374, age: "2h" }),
    ).toEqual({ chapter: "c.374", age: "· 2h" });
    expect(
      statusDetail({
        label: "+234",
        color: "warning",
        chapter: 597,
        suspicious: true,
        age: "3d",
      }),
    ).toEqual({ chapter: "c.597?", age: "· 3d" });
    expect(
      statusDetail({ label: "error", color: "destructive", age: "10m" }),
    ).toEqual({ chapter: "", age: "10m" });
    expect(statusDetail({ label: "not scanned", color: "secondary" })).toEqual({
      chapter: "",
      age: "",
    });
    expect(
      statusDetail({ label: "+0", color: "warning", chapter: 0, age: "1d" }),
    ).toEqual({ chapter: "c.0", age: "· 1d" });
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
    expect(excludedBy(false)).toBe("auto");
    expect(excludedBy(true)).toBe("you");
  });

  it("offers retry only while an exclusion is automatic", () => {
    const actions = {
      retryAuto: () => {},
      resetAll: () => {},
      searchIn: () => {},
    };
    const labels = (pinned: boolean[], busy = false, searching = false) =>
      excludedMenuItems(
        pinned.map((p, i) => ({ pinned: p, source: { id: `s${i}` } })),
        busy,
        searching,
        actions,
      ).map((item) => `${item.label}${item.disabled ? " (off)" : ""}`);

    expect(labels([true, false])).toEqual([
      "Search titles",
      "Retry auto-excluded",
      "Reset all",
    ]);
    expect(labels([true], false, true)).toEqual([
      "Stop searching",
      "Reset all",
    ]);
    expect(labels([false], true)).toEqual([
      "Search titles",
      "Retry auto-excluded (off)",
      "Reset all (off)",
    ]);
  });

  it("joins downloads to a count, never to a word", () => {
    const labels = (badges: ReturnType<typeof statusBadges>) =>
      badges.map((b) => b.segments.map((s) => s.label));
    const count = { label: "+12", color: "success" } as const;
    expect(labels(statusBadges(count, false, 4))).toEqual([["4", "+12"]]);
    expect(labels(statusBadges({ ...count, label: "-3" }, false, 4))).toEqual([
      ["4", "-3"],
    ]);
    expect(labels(statusBadges(count, false, 0))).toEqual([["+12"]]);
    expect(labels(statusBadges(count, true, 4))).toEqual([
      ["scanning…"],
      ["4"],
    ]);
    expect(
      labels(statusBadges({ label: "no match", color: "warning" }, false, 9)),
    ).toEqual([["no match"], ["9"]]);
  });
});
