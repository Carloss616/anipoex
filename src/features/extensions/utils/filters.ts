import type { Extension, Language } from "./extension";

export const EXTENSION_FILTERS = [
  "all",
  "installed",
  "available",
  "updates",
] as const;
export type ExtensionFilter = (typeof EXTENSION_FILTERS)[number];

export const FILTER_TITLES: Record<ExtensionFilter, string> = {
  all: "All",
  installed: "Installed",
  available: "Available",
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

/** Each language once, by name. */
export function languagesOf(extensions: Extension[]): Language[] {
  const byCode = new Map(extensions.map((e) => [e.language.code, e.language]));
  return [...byCode.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** A known language code, or `undefined` for every language. */
export function parseLanguage(
  raw: string | string[] | undefined,
  known: Language[],
): string | undefined {
  const value = first(raw);
  return known.some((l) => l.code === value) ? value : undefined;
}

export const extensionCount = (count: number) =>
  `${count} ${count === 1 ? "extension" : "extensions"}`;
