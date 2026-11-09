import { describe, expect, it } from "bun:test";
import type { RailState } from "@/features/manga/state/title-search";
import { matchesByTitle } from "./title-matches";

const page = (title: string) => ({
  url: `/${title}`,
  title,
  thumbnailUrl: null,
});
const done = (...titles: string[]): RailState => ({
  status: "done",
  mangas: titles.map(page),
  page: 1,
  hasNextPage: false,
  loadingMore: false,
});

describe("matchesByTitle", () => {
  it("takes the same title in the other sources' loaded results", () => {
    const rails = {
      a: done("Dark Lady", "Other"),
      b: done("Dark lady"),
      c: done("Lady Dark Knight"),
    };
    expect(matchesByTitle(rails, ["Dark Lady"], () => false)).toEqual([
      { sourceId: "a", manga: page("Dark Lady") },
      { sourceId: "b", manga: page("Dark lady") },
    ]);
  });

  it("skips the sources the caller rules out", () => {
    const rails = { a: done("Dark Lady"), b: done("Dark Lady") };
    expect(
      matchesByTitle(rails, ["Dark Lady"], (id) => id === "a").map(
        (m) => m.sourceId,
      ),
    ).toEqual(["b"]);
  });

  it("skips a rail still loading or failed", () => {
    const rails = {
      a: { ...done("Dark Lady"), status: "loading" as const },
      b: { ...done("Dark Lady"), status: "error" as const },
    };
    expect(matchesByTitle(rails, ["Dark Lady"], () => false)).toEqual([]);
  });
});
