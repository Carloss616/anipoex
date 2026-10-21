import { describe, expect, it } from "bun:test";
import {
  normalizeTitle,
  pickMatch,
  readMatch,
  searchTitles,
} from "./source-match";

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

  it("joins apostrophes to their word", () => {
    expect(normalizeTitle("Omniscient Reader’s Viewpoint")).toBe(
      "omniscient readers viewpoint",
    );
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

  // Titles below are what two sources answered.
  it("ignores spaces, hyphens and romaji long vowels", () => {
    const hit = result(
      "Kaguya-sama wa Kokurasetai: Tensai-tachi no Ren'ai Zunōsen",
    );
    expect(
      pickMatch(
        [result("Kaguya-sama wa Kokurasetai: Doujin-ban"), hit],
        ["Kaguya-sama wa Kokurasetai: Tensai-tachi no Renai Zunousen"],
      ),
    ).toBe(hit);
  });

  it("prefers an equal title over a tagged one", () => {
    const hit = result("One Piece");
    expect(pickMatch([result("One Piece (Català)"), hit], ["One Piece"])).toBe(
      hit,
    );
  });

  it("drops a bracketed tag when nothing is equal", () => {
    const hit = result("Boku no Hero Academia (Official Colored)");
    expect(
      pickMatch(
        [result("Boku no Hero Academia - School Briefs"), hit],
        ["Boku no Hero Academia"],
      ),
    ).toBe(hit);
  });

  it("keeps a novel tag but not a novel in the name", () => {
    const hit = result("The Novel's Extra (Remake)");
    expect(pickMatch([hit], ["The Novel's Extra"])).toBe(hit);
  });

  it("never takes a novel, a sequel or a longer title", () => {
    const titles = ["The Beginning After the End", "Solo Leveling", "Monster"];
    expect(
      pickMatch(
        [
          result("The Beginning After The End (Novel)"),
          result("The Beginning After The End *NOVELA"),
          result("Solo Leveling: Ragnarok"),
          result("Solo Leveling 2"),
          result("Monsters"),
        ],
        titles,
      ),
    ).toBeNull();
  });
});

describe("searchTitles", () => {
  it("searches romaji, English, then Latin synonyms, once each and at most four", () => {
    const { search } = searchTitles({
      title: {
        romaji: "Kimetsu no Yaiba",
        english: "Demon Slayer: Kimetsu no Yaiba",
      },
      synonyms: [
        "KIMETSU NO YAIBA",
        "鬼灭之刃",
        "Клинок, рассекающий демонов",
        "Guardianes de la Noche",
        "Demon Slayer",
        "Lâmina",
      ],
    });
    expect(search).toEqual([
      "Kimetsu no Yaiba",
      "Demon Slayer: Kimetsu no Yaiba",
      "Guardianes de la Noche",
      "Demon Slayer",
    ]);
  });
});
