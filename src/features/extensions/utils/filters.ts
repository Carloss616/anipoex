import type { Extension, ExtensionCounts } from "./extension";

export const EXTENSION_FILTERS = ["all", "installed", "updates"] as const;
export type ExtensionFilter = (typeof EXTENSION_FILTERS)[number];

/** The `Select` / menu value for "no language filter"; never put in the URL. */
export const ALL_LANGUAGES = "all";

const TITLES: Record<ExtensionFilter, string> = {
  all: "All",
  installed: "Installed",
  updates: "Updates",
};

const first = (raw: string | string[] | undefined) =>
  Array.isArray(raw) ? raw[0] : raw;

/** Route params arrive unchecked (deep links, typed URLs): anything unknown is `all`. */
export function parseFilter(
  raw: string | string[] | undefined,
): ExtensionFilter {
  const value = first(raw);
  return EXTENSION_FILTERS.find((f) => f === value) ?? "all";
}

export function languagesOf(extensions: Extension[]): string[] {
  return [...new Set(extensions.map((e) => e.language))].sort();
}

/** `undefined` means every language. */
export function parseLanguage(
  raw: string | string[] | undefined,
  known: string[],
): string | undefined {
  const value = first(raw);
  return value && known.includes(value) ? value : undefined;
}

export function filterLabel(
  filter: ExtensionFilter,
  counts: ExtensionCounts,
): string {
  const count = filter === "all" ? 0 : counts[filter];
  return count > 0 ? `${TITLES[filter]} ${count}` : TITLES[filter];
}
