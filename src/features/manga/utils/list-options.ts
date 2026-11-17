export type TriState = "any" | "include" | "exclude";

export const FILTER_KEYS = [
  "unread",
  "started",
  "downloaded",
  "completed",
] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];
export type ListFilters = Record<FilterKey, TriState>;

export const SORT_KEYS = [
  "title",
  "unread",
  "chapters",
  "updated",
  "added",
  "score",
] as const;
export type SortKey = (typeof SORT_KEYS)[number];
export interface ListSort {
  by: SortKey;
  ascending: boolean;
}

export interface ListOptions {
  filters: ListFilters;
  sort: ListSort;
}

export const DEFAULT_LIST_OPTIONS: ListOptions = {
  filters: {
    unread: "any",
    started: "any",
    downloaded: "any",
    completed: "any",
  },
  sort: { by: "title", ascending: true },
};

const TRI_STATES: TriState[] = ["any", "include", "exclude"];

const naturalDirection = (by: SortKey) => by === "title";

const record = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;

/** Reads a value from another build; what is unreadable takes its default. */
export function normalizeListOptions(raw: unknown): ListOptions | undefined {
  const root = record(raw);
  if (!root) return undefined;
  const filters = record(root.filters);
  const sort = record(root.sort);
  const by =
    SORT_KEYS.find((key) => key === sort?.by) ?? DEFAULT_LIST_OPTIONS.sort.by;
  return {
    filters: Object.fromEntries(
      FILTER_KEYS.map((key) => [
        key,
        TRI_STATES.find((state) => state === filters?.[key]) ?? "any",
      ]),
    ) as ListFilters,
    sort: {
      by,
      ascending:
        typeof sort?.ascending === "boolean"
          ? sort.ascending
          : naturalDirection(by),
    },
  };
}

export function nextTriState(state: TriState): TriState {
  return TRI_STATES[(TRI_STATES.indexOf(state) + 1) % TRI_STATES.length];
}

/** Picking the active order flips it; a new one starts in its natural direction. */
export function pickSort(current: ListSort, by: SortKey): ListSort {
  return by === current.by
    ? { by, ascending: !current.ascending }
    : { by, ascending: naturalDirection(by) };
}

export const hasActiveFilters = (filters: ListFilters) =>
  FILTER_KEYS.some((key) => filters[key] !== "any");

export const withoutFilters = (options: ListOptions): ListOptions => ({
  ...options,
  filters: DEFAULT_LIST_OPTIONS.filters,
});
