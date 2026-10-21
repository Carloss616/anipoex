import { describe, expect, it } from "bun:test";
import { railItems } from "./rail-items";

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
