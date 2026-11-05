import { describe, expect, it, mock } from "bun:test";
import type { SourceManga } from "@/features/extensions";
import { cardMenu } from "./card-menu";

const manga = {
  url: "/1",
  title: "Kusuriya no Hitorigoto",
  thumbnailUrl: null,
};
const on = () => ({
  setMatch: mock((_manga: SourceManga) => {}),
  removeMatch: mock(() => {}),
  openPage: mock((_url: string) => {}),
});
const rows = (
  menu: ReturnType<typeof cardMenu>,
): { label: string; onPress: () => void; disabled?: boolean }[] =>
  menu[0].items;
const labels = (menu: ReturnType<typeof cardMenu>) =>
  rows(menu).map((item) => item.label);

describe("cardMenu", () => {
  it("offers a result as the match, under its full title", () => {
    const actions = on();
    const items = cardMenu({ manga, current: false }, false, actions);
    expect(items[0].heading).toBe(manga.title);
    expect(labels(items)).toEqual(["Use as match", "Open website"]);
    rows(items)[0].onPress();
    expect(actions.setMatch).toHaveBeenCalledWith(manga);
  });

  it("removes a current match set by hand", () => {
    const items = cardMenu({ manga, current: true }, true, on());
    expect(labels(items)).toEqual(["Remove match", "Open website"]);
  });

  it("disables the match actions while the source is being scanned", () => {
    const busy = cardMenu({ manga, current: false }, false, on(), true);
    expect(rows(busy)[0]).toMatchObject({
      label: "Use as match",
      disabled: true,
    });
    const remove = cardMenu({ manga, current: true }, true, on(), true);
    expect(rows(remove)[0]).toMatchObject({
      label: "Remove match",
      disabled: true,
    });
  });

  it("only opens the page of an automatic current match", () => {
    const actions = on();
    const items = cardMenu({ manga, current: true }, false, actions);
    expect(labels(items)).toEqual(["Open website"]);
    rows(items)[0].onPress();
    expect(actions.openPage).toHaveBeenCalledWith("/1");
  });
});
