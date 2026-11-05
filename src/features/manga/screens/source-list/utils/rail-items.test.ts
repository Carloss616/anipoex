import { describe, expect, it } from "bun:test";
import { railItems, railNotice } from "./rail-items";

const hit = (url: string, thumbnailUrl: string | null = null) => ({
  url,
  title: url,
  thumbnailUrl,
});

describe("railItems", () => {
  it("is the results when there is no current match", () => {
    expect(railItems(undefined, [hit("/1"), hit("/2")])).toEqual([
      { manga: hit("/1"), current: false },
      { manga: hit("/2"), current: false },
    ]);
  });

  it("puts the current match first once", () => {
    expect(railItems(hit("/2"), [hit("/1"), hit("/2")])).toEqual([
      { manga: hit("/2"), current: true },
      { manga: hit("/1"), current: false },
    ]);
  });

  it("takes the current thumbnail from its result", () => {
    const current = { url: "/2", title: "Mine" };
    expect(railItems(current, [hit("/2", "cover.jpg")])[0]).toEqual({
      manga: { url: "/2", title: "Mine", thumbnailUrl: "cover.jpg" },
      current: true,
    });
  });
});

describe("railNotice", () => {
  it("reports a failed first page even with a current match", () => {
    expect(railNotice({ status: "error", mangas: [] })).toBe("error");
  });

  it("reports no results when the search found nothing", () => {
    expect(railNotice({ status: "done", mangas: [] })).toBe("empty");
  });

  it("says nothing once there are results", () => {
    expect(railNotice({ status: "done", mangas: [hit("/1")] })).toBeNull();
    expect(railNotice({ status: "error", mangas: [hit("/1")] })).toBeNull();
  });
});
