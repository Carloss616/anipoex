import { beforeEach, describe, expect, it, mock } from "bun:test";

type Page = { mangas: unknown[]; hasNextPage: boolean };
const pending: Record<
  string,
  { resolve: (page: Page) => void; reject: (error: Error) => void }
> = {};
const search = mock(
  (sourceId: string, query: string, page: number) =>
    new Promise<Page>((resolve, reject) => {
      pending[`${sourceId}:${query}:${page}`] = { resolve, reject };
    }),
);

mock.module("@/features/extensions", () => ({
  runtime: { search, chapters: async () => ({ chapters: [] }) },
}));

const {
  loadMoreTitles,
  startTitleSearch,
  stopTitleSearch,
  submitTitleQuery,
  titleQuery$,
  titleSearch$,
} = await import("./title-search");

const hit = (url: string) => ({ url, title: url, thumbnailUrl: null });
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => search.mockClear());

describe("startTitleSearch", () => {
  it("stores page 1 per source", async () => {
    const done = startTitleSearch(2001, ["x", "y"], "q");
    expect(titleSearch$["2001"].x.status.peek()).toBe("loading");
    expect(titleQuery$["2001"].peek()).toBe("q");
    await flush();
    pending["x:q:1"].resolve({ mangas: [hit("/1")], hasNextPage: true });
    pending["y:q:1"].resolve({ mangas: [], hasNextPage: false });
    await done;
    expect(titleSearch$["2001"].x.peek()).toMatchObject({
      status: "done",
      mangas: [hit("/1")],
      page: 1,
      hasNextPage: true,
    });
    expect(titleSearch$["2001"].y.peek()).toMatchObject({
      status: "done",
      mangas: [],
    });
  });

  it("marks every source loading before the first batch answers", async () => {
    const ids = Array.from({ length: 11 }, (_, i) => `s${i}`);
    const done = startTitleSearch(2008, ids, "q");
    expect(titleSearch$["2008"].s10.status.peek()).toBe("loading");
    await flush();
    for (const id of ids.slice(0, 10))
      pending[`${id}:q:1`].resolve({ mangas: [], hasNextPage: false });
    await flush();
    pending["s10:q:1"].resolve({ mangas: [], hasNextPage: false });
    await done;
    expect(titleSearch$["2008"].s10.status.peek()).toBe("done");
  });

  it("sets error when page 1 fails", async () => {
    const done = startTitleSearch(2002, ["x"], "q");
    await flush();
    pending["x:q:1"].reject(new Error("down"));
    await done;
    expect(titleSearch$["2002"].x.peek()).toMatchObject({
      status: "error",
      error: "down",
    });
  });
});

describe("submitTitleQuery", () => {
  it("drops an answer from an older query", async () => {
    const first = startTitleSearch(2003, ["x"], "a");
    await flush();
    const second = submitTitleQuery(2003, "b");
    await flush();
    pending["x:b:1"].resolve({ mangas: [hit("/b")], hasNextPage: false });
    pending["x:a:1"].resolve({ mangas: [hit("/a")], hasNextPage: false });
    await Promise.all([first, second]);
    expect(titleSearch$["2003"].x.mangas.peek()).toEqual([hit("/b")]);
    expect(titleQuery$["2003"].peek()).toBe("b");
  });
});

describe("loadMoreTitles", () => {
  const ready = async (mangaId: number, hasNextPage = true) => {
    const done = startTitleSearch(mangaId, ["x"], "q");
    await flush();
    pending["x:q:1"].resolve({ mangas: [hit("/1"), hit("/2")], hasNextPage });
    await done;
  };

  it("appends the next page without repeats", async () => {
    await ready(2004);
    const more = loadMoreTitles(2004, "x");
    expect(titleSearch$["2004"].x.loadingMore.peek()).toBe(true);
    await flush();
    pending["x:q:2"].resolve({
      mangas: [hit("/2"), hit("/3")],
      hasNextPage: false,
    });
    await more;
    expect(titleSearch$["2004"].x.peek()).toMatchObject({
      mangas: [hit("/1"), hit("/2"), hit("/3")],
      page: 2,
      hasNextPage: false,
      loadingMore: false,
    });
  });

  it("ignores a second call while loading and stops at the last page", async () => {
    await ready(2005);
    search.mockClear();
    const more = loadMoreTitles(2005, "x");
    void loadMoreTitles(2005, "x");
    await flush();
    expect(search).toHaveBeenCalledTimes(1);
    pending["x:q:2"].resolve({ mangas: [], hasNextPage: false });
    await more;
    await loadMoreTitles(2005, "x");
    expect(search).toHaveBeenCalledTimes(1);
  });

  it("keeps the rows when the next page fails", async () => {
    await ready(2006);
    const more = loadMoreTitles(2006, "x");
    await flush();
    pending["x:q:2"].reject(new Error("down"));
    await more;
    expect(titleSearch$["2006"].x.peek()).toMatchObject({
      status: "done",
      mangas: [hit("/1"), hit("/2")],
      page: 1,
      loadingMore: false,
      error: "down",
    });
  });
});

describe("stopTitleSearch", () => {
  it("removes one source, or all with the query", async () => {
    void startTitleSearch(2007, ["x", "y"], "q");
    stopTitleSearch(2007, "x");
    expect(titleSearch$["2007"].x.peek()).toBeUndefined();
    expect(titleSearch$["2007"].y.peek()).toBeDefined();
    stopTitleSearch(2007);
    expect(titleSearch$["2007"].peek()).toBeUndefined();
    expect(titleQuery$["2007"].peek()).toBeUndefined();
  });
});
