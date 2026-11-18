import { describe, expect, it } from "bun:test";
import { MediaStatus } from "@/graphql/types.generated";
import {
  applyListOptions,
  downloadedIds,
  type ListLookups,
  needsLatest,
} from "./apply-list-options";
import { DEFAULT_LIST_OPTIONS, type ListOptions } from "./list-options";
import type { MangaEntry } from "./to-entries";

const entry = (
  id: number,
  extra: {
    title?: string | null;
    status?: MediaStatus | null;
    chapters?: number | null;
    progress?: number;
  } = {},
) =>
  ({
    id,
    status: extra.status ?? null,
    chapters: extra.chapters ?? null,
    title: {
      userPreferred: extra.title === undefined ? `Title ${id}` : extra.title,
    },
    mediaListEntry: { progress: extra.progress ?? 0 },
  }) as unknown as MangaEntry;

const lookups = (over: Partial<ListLookups> = {}): ListLookups => ({
  fields: {},
  latest: () => undefined,
  downloaded: new Set(),
  ...over,
});

const options = (patch: {
  filters?: Partial<ListOptions["filters"]>;
  sort?: ListOptions["sort"];
}): ListOptions => ({
  filters: { ...DEFAULT_LIST_OPTIONS.filters, ...patch.filters },
  sort: patch.sort ?? DEFAULT_LIST_OPTIONS.sort,
});

const ids = (list: MangaEntry[]) => list.map((item) => item.id);

describe("applyListOptions", () => {
  it("sorts by title and leaves the ones without a title last", () => {
    const list = [
      entry(1, { title: "b" }),
      entry(2, { title: "Á" }),
      entry(3, { title: "c" }),
      entry(4, { title: null }),
      entry(5, { title: "" }),
    ];
    const result = applyListOptions(list, DEFAULT_LIST_OPTIONS, lookups());
    expect(ids(result)).toEqual([2, 1, 3, 4, 5]);
  });

  it("filters unread", () => {
    const list = [entry(1), entry(2), entry(3)];
    const l = lookups({
      fields: { 1: { progress: 5 }, 2: { progress: 3 } },
      latest: (id) => ({ 1: 10, 2: 3 })[id],
    });
    const include = options({ filters: { unread: "include" } });
    const exclude = options({ filters: { unread: "exclude" } });
    expect(ids(applyListOptions(list, include, l))).toEqual([1]);
    expect(ids(applyListOptions(list, exclude, l))).toEqual([2, 3]);
  });

  it("filters started by the entry fields, not the media", () => {
    const list = [entry(1, { progress: 9 }), entry(2)];
    const l = lookups({ fields: { 1: { progress: 0 }, 2: { progress: 1 } } });
    const result = applyListOptions(
      list,
      options({ filters: { started: "include" } }),
      l,
    );
    expect(ids(result)).toEqual([2]);
  });

  it("filters downloaded and completed", () => {
    const list = [
      entry(1, { status: MediaStatus.Finished }),
      entry(2, { status: MediaStatus.Releasing }),
      entry(3),
    ];
    const l = lookups({ downloaded: new Set([1]) });
    const downloaded = options({ filters: { downloaded: "include" } });
    const notCompleted = options({ filters: { completed: "exclude" } });
    expect(ids(applyListOptions(list, downloaded, l))).toEqual([1]);
    expect(ids(applyListOptions(list, notCompleted, l))).toEqual([2, 3]);
  });

  it("combines filters with and", () => {
    const list = [entry(1), entry(2)];
    const l = lookups({
      fields: { 1: { progress: 1 }, 2: { progress: 1 } },
      downloaded: new Set([2]),
    });
    const result = applyListOptions(
      list,
      options({ filters: { started: "include", downloaded: "include" } }),
      l,
    );
    expect(ids(result)).toEqual([2]);
  });

  it("sorts by unread, undefined last in both directions", () => {
    const list = [entry(3), entry(2), entry(1)];
    const l = lookups({
      fields: { 1: { progress: 5 }, 2: { progress: 10 } },
      latest: (id) => ({ 1: 10, 2: 10 })[id],
    });
    const desc = options({ sort: { by: "unread", ascending: false } });
    const asc = options({ sort: { by: "unread", ascending: true } });
    expect(ids(applyListOptions(list, desc, l))).toEqual([1, 2, 3]);
    expect(ids(applyListOptions(list, asc, l))).toEqual([2, 1, 3]);
  });

  it("sorts by chapters, falling back to latest", () => {
    const list = [entry(1, { chapters: 5 }), entry(2), entry(3)];
    const l = lookups({ latest: (id) => ({ 2: 50 })[id] });
    const result = applyListOptions(
      list,
      options({ sort: { by: "chapters", ascending: false } }),
      l,
    );
    expect(ids(result)).toEqual([2, 1, 3]);
  });

  it("sorts by updated and score with the missing ones last", () => {
    const list = [entry(1), entry(2), entry(3)];
    const l = lookups({
      fields: {
        1: { progress: 0, updatedAt: 10, score: 5 },
        2: { progress: 0 },
        3: { progress: 0, updatedAt: 20, score: 9 },
      },
    });
    const updated = options({ sort: { by: "updated", ascending: false } });
    const score = options({ sort: { by: "score", ascending: false } });
    expect(ids(applyListOptions(list, updated, l))).toEqual([3, 1, 2]);
    expect(ids(applyListOptions(list, score, l))).toEqual([3, 1, 2]);
  });

  it("breaks ties by title, then id", () => {
    const list = [
      entry(3, { title: "Title B" }),
      entry(2, { title: "Title A" }),
      entry(1, { title: "Title A" }),
    ];
    const l = lookups({
      fields: {
        1: { progress: 0, score: 7 },
        2: { progress: 0, score: 7 },
        3: { progress: 0, score: 7 },
      },
    });
    const result = applyListOptions(
      list,
      options({ sort: { by: "score", ascending: false } }),
      l,
    );
    expect(ids(result)).toEqual([1, 2, 3]);
  });

  it("reads the latest chapter only where the options need it", () => {
    const list = [entry(1, { chapters: 5 }), entry(2), entry(3)];
    const asked: number[] = [];
    const latest = (id: number) => {
      asked.push(id);
      return 10;
    };
    const chapters = options({ sort: { by: "chapters", ascending: false } });
    applyListOptions(list, chapters, lookups({ latest }));
    expect(asked).toEqual([2, 3]);
    asked.length = 0;
    applyListOptions(list, DEFAULT_LIST_OPTIONS, lookups({ latest }));
    expect(asked).toEqual([]);
  });

  it("returns the same objects and leaves the input alone", () => {
    const list = [
      entry(2, { title: "Title B" }),
      entry(1, { title: "Title A" }),
    ];
    const copy = [...list];
    const result = applyListOptions(list, DEFAULT_LIST_OPTIONS, lookups());
    expect(result[0]).toBe(list[1]);
    expect(result[1]).toBe(list[0]);
    expect(list).toEqual(copy);
  });
});

describe("needsLatest", () => {
  it("is false for the defaults and a score sort", () => {
    const score = options({ sort: { by: "score", ascending: false } });
    expect(needsLatest(DEFAULT_LIST_OPTIONS)).toBe(false);
    expect(needsLatest(score)).toBe(false);
  });

  it("is true for the unread filter and the unread or chapters sort", () => {
    const unread = options({ sort: { by: "unread", ascending: false } });
    const chapters = options({ sort: { by: "chapters", ascending: false } });
    expect(needsLatest(options({ filters: { unread: "include" } }))).toBe(true);
    expect(needsLatest(unread)).toBe(true);
    expect(needsLatest(chapters)).toBe(true);
  });
});

describe("downloadedIds", () => {
  it("keeps the manga with at least one chapter", () => {
    const result = downloadedIds({
      "1/s": { h: "local" },
      "2/s": {},
      "3/a": {},
      "3/b": { h: "cloud" },
    });
    expect(result).toEqual(new Set([1, 3]));
  });
});
