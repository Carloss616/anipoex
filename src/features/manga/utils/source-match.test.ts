import { describe, expect, it } from "bun:test";
import { normalizeTitle, pickMatch, readMatch } from "./source-match";

const result = (title: string) => ({
  url: `/${title}`,
  title,
  thumbnailUrl: null,
});

describe("readMatch", () => {
  it("ignores values from before matching", () => {
    expect(readMatch("example")).toBeUndefined();
    expect(readMatch(undefined)).toBeUndefined();
  });

  it("reads a stored match", () => {
    const value = { sourceId: "1", manga: null };
    expect(readMatch(value)).toEqual(value);
  });

  it("reads a pick whose search is pending", () => {
    const value = { sourceId: "1" };
    expect(readMatch(value)).toEqual(value);
  });

  it("reads a match with a manga", () => {
    const value = { sourceId: "1", manga: { url: "/a", title: "A" } };
    expect(readMatch(value)).toEqual(value);
  });

  it("ignores a manga that is not a url and a title", () => {
    expect(readMatch({ sourceId: "1", manga: "x" })).toBeUndefined();
    expect(readMatch({ sourceId: "1", manga: {} })).toBeUndefined();
    expect(
      readMatch({ sourceId: "1", manga: { url: 1, title: "A" } }),
    ).toBeUndefined();
  });
});

describe("normalizeTitle", () => {
  it("drops case, diacritics and punctuation", () => {
    expect(normalizeTitle("ONE  PIECE!")).toBe("one piece");
    expect(normalizeTitle("Pokémon: Adventures")).toBe("pokemon adventures");
  });

  it("keeps non-Latin scripts", () => {
    expect(normalizeTitle("ワンピース")).toBe("ワンピース");
  });
});

describe("pickMatch", () => {
  it("picks an equal title ignoring case and punctuation", () => {
    const hit = result("ONE PIECE!");
    expect(pickMatch([result("Other"), hit], ["One Piece"])).toBe(hit);
  });

  it("rejects an approximate title", () => {
    expect(pickMatch([result("One Piece Party")], ["One Piece"])).toBeNull();
  });

  it("matches a synonym and ignores null titles", () => {
    const hit = result("Wan Pisu");
    expect(pickMatch([hit], [null, undefined, "", "Wan Pisu"])).toBe(hit);
  });
});
