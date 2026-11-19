import { describe, expect, it } from "bun:test";
import { groupPages, pageForPath, visiblePages } from "./settings-pages";

describe("visiblePages", () => {
  it("hides runtime-only pages without the runtime", () => {
    const ids = visiblePages(false).map((page) => page.id);
    expect(ids).not.toContain("sources");
    expect(ids).not.toContain("downloads");
    expect(visiblePages(true).map((page) => page.id)).toEqual([
      "account",
      "activity",
      "appearance",
      "home",
      "sync",
      "sources",
      "downloads",
    ]);
  });
});

describe("groupPages", () => {
  it("groups pages under Status, General, Sources, skipping empty groups", () => {
    const groups = groupPages(visiblePages(false));
    expect(groups.map((group) => group.title)).toEqual(["Status", "General"]);
    const grouped = groups.flatMap((group) => group.pages.map((p) => p.id));
    expect(grouped).not.toContain("account");
    expect(
      groupPages(visiblePages(true))
        .at(-1)
        ?.pages.map((p) => p.id),
    ).toEqual(["sources", "downloads"]);
  });
});

describe("pageForPath", () => {
  it("maps a path to the page that owns it", () => {
    expect(pageForPath("/settings/languages")).toBe("sources");
    expect(pageForPath("/settings/layout")).toBe("home");
    expect(pageForPath("/settings/activity")).toBe("activity");
    expect(pageForPath("/settings/sync")).toBe("sync");
    expect(pageForPath("/settings")).toBeUndefined();
    expect(pageForPath("/manga")).toBeUndefined();
  });
});
