import { describe, expect, it } from "bun:test";
import {
  DETAIL_ROUTE,
  isOverDetail,
  sourceListHref,
  sourceListMangaId,
} from "./source-list-href";

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

describe("isOverDetail", () => {
  const detail = (id: string) => ({ name: DETAIL_ROUTE, params: { id } });
  const list = { name: "manga/[id]/sources", params: { id: "12" } };

  it("is true with the manga's detail right under the list", () => {
    expect(isOverDetail({ routes: [detail("12"), list], index: 1 }, "12")).toBe(
      true,
    );
  });

  it("is false when a link opened the list alone", () => {
    expect(isOverDetail({ routes: [list], index: 0 }, "12")).toBe(false);
  });

  it("is false over another manga's detail", () => {
    expect(isOverDetail({ routes: [detail("7"), list], index: 1 }, "12")).toBe(
      false,
    );
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
