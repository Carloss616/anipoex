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
const labels = (items: { label: string }[]) => items.map((item) => item.label);

describe("cardMenu", () => {
  it("offers a result as the match, under its full title", () => {
    const actions = on();
    const items = cardMenu({ manga, current: false }, false, actions);
    expect(labels(items)).toEqual([
      manga.title,
      "Use as match",
      "Open website",
    ]);
    expect(items[0]).toMatchObject({ disabled: true });
    (items[1] as { onPress: () => void }).onPress();
    expect(actions.setMatch).toHaveBeenCalledWith(manga);
  });

  it("removes a current match set by hand", () => {
    const items = cardMenu({ manga, current: true }, true, on());
    expect(labels(items)).toEqual([
      manga.title,
      "Remove match",
      "Open website",
    ]);
  });

  it("disables the match actions while the source is being scanned", () => {
    const busy = cardMenu({ manga, current: false }, false, on(), true);
    expect(busy[1]).toMatchObject({ label: "Use as match", disabled: true });
    const remove = cardMenu({ manga, current: true }, true, on(), true);
    expect(remove[1]).toMatchObject({ label: "Remove match", disabled: true });
  });

  it("only opens the page of an automatic current match", () => {
    const actions = on();
    const items = cardMenu({ manga, current: true }, false, actions);
    expect(labels(items)).toEqual([manga.title, "Open website"]);
    (items[1] as { onPress: () => void }).onPress();
    expect(actions.openPage).toHaveBeenCalledWith("/1");
  });
});
