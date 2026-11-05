import { describe, expect, test } from "bun:test";
import { MediaFormat, MediaSort, MediaStatus } from "@/graphql/types.generated";
import {
  hasSearch,
  parseSearchParams,
  searchTitle,
  sortOf,
  toRouteParams,
  toSearchVariables,
  toSetParams,
} from "./search-params";

describe("parseSearchParams", () => {
  test("trims the query", () => {
    expect(parseSearchParams({ q: "  chain  " })).toEqual({ q: "chain" });
  });

  test("drops a blank query", () => {
    expect(parseSearchParams({ q: "   " })).toEqual({});
  });

  test("takes the first value of a repeated param", () => {
    expect(parseSearchParams({ q: ["a", "b"] })).toEqual({ q: "a" });
  });

  test("drops values it doesn't know", () => {
    expect(
      parseSearchParams({
        format: "foo",
        sort: "x",
        year: "abc",
        country: "US",
      }),
    ).toEqual({});
  });

  test("reads the year as a number", () => {
    expect(parseSearchParams({ year: "2025" })).toEqual({ year: 2025 });
  });
});

describe("hasSearch", () => {
  test("is false with no params", () => {
    expect(hasSearch({})).toBe(false);
  });

  test("is true with a filter alone", () => {
    expect(hasSearch({ sort: "trending" })).toBe(true);
  });
});

describe("toSearchVariables", () => {
  test("sorts a text search by match", () => {
    expect(toSearchVariables({ q: "x" }, 1).sort).toEqual([
      MediaSort.SearchMatch,
    ]);
  });

  test("sorts a browse by popularity", () => {
    expect(toSearchVariables({}, 1).sort).toEqual([MediaSort.PopularityDesc]);
  });

  test("maps the named sorts", () => {
    expect(toSearchVariables({ sort: "trending" }, 1).sort).toEqual([
      MediaSort.TrendingDesc,
    ]);
    expect(toSearchVariables({ sort: "score" }, 1).sort).toEqual([
      MediaSort.ScoreDesc,
    ]);
  });

  test("a format's country wins over the country param", () => {
    const v = toSearchVariables({ format: "manhwa", country: "JP" }, 1);
    expect(v.format).toBe(MediaFormat.Manga);
    expect(v.country).toBe("KR");
  });

  test("one-shot is a format with no country", () => {
    const v = toSearchVariables({ format: "one-shot" }, 1);
    expect(v.format).toBe(MediaFormat.OneShot);
    expect(v.country).toBeUndefined();
  });

  test("the year starts the date filter", () => {
    expect(toSearchVariables({ year: 2025 }, 1).startDateGreater).toBe(
      20250000,
    );
  });

  test("maps the status and passes the page", () => {
    const v = toSearchVariables({ status: "releasing" }, 3);
    expect(v.status).toBe(MediaStatus.Releasing);
    expect(v.page).toBe(3);
  });
});

describe("toRouteParams", () => {
  test("round-trips every valid param", () => {
    const raw = {
      q: "solo",
      genre: "Action",
      format: "manhwa",
      sort: "score",
      status: "finished",
      country: "KR",
      year: "2024",
    };
    expect(toRouteParams(parseSearchParams(raw))).toEqual(raw);
  });

  test("leaves out a param that was cleared", () => {
    expect(toRouteParams({ q: "solo", genre: undefined })).toEqual({
      q: "solo",
    });
  });
});

describe("sortOf", () => {
  test("defaults to relevance with a query and popularity without", () => {
    expect(sortOf({ q: "x" })).toBe("relevance");
    expect(sortOf({})).toBe("popularity");
    expect(sortOf({ sort: "score" })).toBe("score");
  });
});

describe("toSetParams", () => {
  test("clears every param it doesn't set", () => {
    expect(toSetParams({ q: "solo" })).toEqual({
      q: "solo",
      genre: undefined,
      format: undefined,
      sort: undefined,
      status: undefined,
      country: undefined,
      year: undefined,
    });
  });
});

describe("searchTitle", () => {
  test("is the query when there is one", () => {
    expect(searchTitle({ q: "chain" })).toBe("chain");
  });

  test("names the section whose params match", () => {
    expect(searchTitle({ sort: "trending" })).toBe("Trending now");
  });

  test("falls back to the genre", () => {
    expect(searchTitle({ genre: "Action" })).toBe("Action");
  });

  test("is Search with nothing to name", () => {
    expect(searchTitle({})).toBe("Search");
  });
});
