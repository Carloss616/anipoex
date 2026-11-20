import { describe, expect, it } from "bun:test";
import { matchesQuery } from "./matches-query";
import type { MangaEntry } from "./to-entries";

const berserk = {
  title: {
    __typename: "MediaTitle",
    userPreferred: "Berserk",
    english: null,
    romaji: "Berserk",
    native: "ベルセルク",
  },
  synonyms: ["Kenpuu Denki", null],
} as unknown as MangaEntry;

describe("matchesQuery", () => {
  it("ignores the title's GraphQL type name", () => {
    expect(matchesQuery(berserk, "title")).toBe(false);
    expect(matchesQuery(berserk, "media")).toBe(false);
  });

  it("matches any title or synonym", () => {
    expect(matchesQuery(berserk, "bers")).toBe(true);
    expect(matchesQuery(berserk, "ベルセ")).toBe(true);
    expect(matchesQuery(berserk, "denki")).toBe(true);
  });

  it("matches the words of a search in any order, skipping the ones between", () => {
    expect(matchesQuery(berserk, "kenpuu denki")).toBe(true);
    expect(matchesQuery(berserk, "denki kenpuu")).toBe(true);
    expect(matchesQuery(berserk, "kenpuu  ki")).toBe(true);
  });

  it("needs every word in the same title", () => {
    expect(matchesQuery(berserk, "berserk denki")).toBe(false);
    expect(matchesQuery(berserk, "kenpuu guts")).toBe(false);
  });

  it("keeps every manga for an empty search", () => {
    expect(matchesQuery(berserk, "")).toBe(true);
  });
});
