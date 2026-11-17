import { expect, test } from "bun:test";
import {
  DEFAULT_LIST_OPTIONS,
  hasActiveFilters,
  nextTriState,
  normalizeListOptions,
  pickSort,
  withoutFilters,
} from "./list-options";

test("normalizeListOptions reads what it can and defaults the rest", () => {
  expect(normalizeListOptions(undefined)).toBeUndefined();
  expect(normalizeListOptions("x")).toBeUndefined();
  expect(normalizeListOptions({})).toEqual(DEFAULT_LIST_OPTIONS);
  expect(
    normalizeListOptions({
      filters: { unread: "include", started: true },
      sort: { by: "random" },
    }),
  ).toEqual({
    ...DEFAULT_LIST_OPTIONS,
    filters: { ...DEFAULT_LIST_OPTIONS.filters, unread: "include" },
  });
  expect(
    normalizeListOptions({ sort: { by: "score", ascending: "no" } })?.sort,
  ).toEqual({ by: "score", ascending: false });
});

test("nextTriState cycles any, include, exclude", () => {
  expect(nextTriState("any")).toBe("include");
  expect(nextTriState("include")).toBe("exclude");
  expect(nextTriState("exclude")).toBe("any");
});

test("pickSort flips the active order and resets a new one", () => {
  expect(pickSort({ by: "title", ascending: true }, "title")).toEqual({
    by: "title",
    ascending: false,
  });
  expect(pickSort({ by: "title", ascending: false }, "unread")).toEqual({
    by: "unread",
    ascending: false,
  });
  expect(pickSort({ by: "unread", ascending: false }, "title")).toEqual({
    by: "title",
    ascending: true,
  });
});

test("hasActiveFilters and withoutFilters", () => {
  expect(hasActiveFilters(DEFAULT_LIST_OPTIONS.filters)).toBe(false);
  expect(
    hasActiveFilters({ ...DEFAULT_LIST_OPTIONS.filters, completed: "exclude" }),
  ).toBe(true);
  const sorted = {
    filters: { ...DEFAULT_LIST_OPTIONS.filters, unread: "include" as const },
    sort: { by: "score" as const, ascending: false },
  };
  expect(withoutFilters(sorted)).toEqual({
    ...DEFAULT_LIST_OPTIONS,
    sort: sorted.sort,
  });
  expect(withoutFilters(sorted).filters).not.toBe(DEFAULT_LIST_OPTIONS.filters);
});
