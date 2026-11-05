import { describe, expect, it } from "bun:test";
import { titleMenuItems } from "./title-menu";

describe("titleMenuItems", () => {
  it("lists every title once, checks the searched one and submits a pick", () => {
    const picked: string[] = [];
    const items = titleMenuItems(
      {
        title: {
          romaji: "Kimetsu no Yaiba",
          english: "Demon Slayer: Kimetsu no Yaiba",
          userPreferred: "Kimetsu no Yaiba",
          native: "鬼滅の刃",
        },
        synonyms: ["KIMETSU NO YAIBA", "Demon Slayer"],
      },
      "Demon Slayer",
      (title) => picked.push(title),
    );
    expect(items.map((item) => item.label)).toEqual([
      "Kimetsu no Yaiba",
      "Demon Slayer: Kimetsu no Yaiba",
      "鬼滅の刃",
      "Demon Slayer",
    ]);
    expect(
      items.filter((item) => item.checked).map((item) => item.label),
    ).toEqual(["Demon Slayer"]);
    items[2]?.onPress();
    expect(picked).toEqual(["鬼滅の刃"]);
  });
});
