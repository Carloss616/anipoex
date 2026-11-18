import { isRuntimeAvailable } from "@/features/extensions/runtime";
import {
  FILTER_KEYS,
  type FilterKey,
  type SortKey,
  type TriState,
} from "@/features/manga/utils/list-options";
import type { OptionsTab } from "./utils/sheet-state";

export const TABS: readonly [OptionsTab, string][] = [
  ["filter", "Filter"],
  ["sort", "Sort"],
  ["display", "Display"],
];

export const FILTER_LABELS: Record<FilterKey, string> = {
  unread: "Unread",
  started: "Started",
  downloaded: "Downloaded",
  completed: "Completed",
};

/** Beside a filter that isn't "any". */
export const FILTER_STATE_TEXT: Record<TriState, string> = {
  any: "",
  include: "Only",
  exclude: "Excluded",
};

export const SORT_LABELS: Record<SortKey, string> = {
  title: "Alphabetical",
  unread: "Unread",
  chapters: "Total chapters",
  updated: "Last updated",
  added: "Date added",
  score: "Score",
};

export const CHIP_LABELS: Record<
  FilterKey,
  [include: string, exclude: string]
> = {
  unread: ["Unread", "No unread"],
  started: ["Started", "Not started"],
  downloaded: ["Downloaded", "Not downloaded"],
  completed: ["Completed", "Not completed"],
};

// Plain web has no downloads to filter by; desktop does.
export const SHOWN_FILTERS: readonly FilterKey[] = isRuntimeAvailable
  ? FILTER_KEYS
  : FILTER_KEYS.filter((key) => key !== "downloaded");

export const TITLES = [
  ["below", "Below"],
  ["split", "Split"],
  ["over", "Over"],
] as const;
