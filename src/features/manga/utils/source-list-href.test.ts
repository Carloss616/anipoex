import { describe, expect, it } from "bun:test";
import { sourceListHref, sourceListMangaId } from "./source-list-href";

describe("sourceListHref", () => {
  it("links the manga's source list", () => {
    expect(sourceListHref(12)).toEqual({
      pathname: "/manga/[id]/sources",
      params: { id: "12" },
    });
  });

  it("asks for it raised", () => {
    expect(sourceListHref("12", true)).toEqual({
      pathname: "/manga/[id]/sources",
      params: { id: "12", expanded: "1" },
    });
  });
});

describe("sourceListMangaId", () => {
  it("reads the manga whose source list is open", () => {
    expect(sourceListMangaId("/manga/12/sources")).toBe(12);
  });

  it("is null anywhere else", () => {
    expect(sourceListMangaId("/manga/12")).toBeNull();
    expect(sourceListMangaId("/manga/12/reader")).toBeNull();
    expect(sourceListMangaId("/extensions/repos")).toBeNull();
  });
});
