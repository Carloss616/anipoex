export const ACTIVITY_FILTERS = [
  "all",
  "scans",
  "downloads",
  "send",
  "sync",
] as const;
export type ActivityFilter = (typeof ACTIVITY_FILTERS)[number];

export const FILTER_TITLES: Record<ActivityFilter, string> = {
  all: "All",
  scans: "Scans",
  downloads: "Downloads",
  send: "To send",
  sync: "Sync",
};

export function parseFilter(param: string | undefined): ActivityFilter {
  return ACTIVITY_FILTERS.find((filter) => filter === param) ?? "all";
}

// Display order; each belongs to one filter.
export const SECTIONS = [
  "running",
  "queue",
  "downloads",
  "skipped",
  "entries",
  "unsent",
  "sync",
] as const;
export type ActivitySection = (typeof SECTIONS)[number];

export const SECTION_FILTER: Record<
  ActivitySection,
  Exclude<ActivityFilter, "all">
> = {
  running: "scans",
  queue: "scans",
  skipped: "scans",
  downloads: "downloads",
  entries: "send",
  unsent: "send",
  sync: "sync",
};

export type ActivityIds = Record<ActivitySection, string[]>;
export type ActivityCounts = Record<ActivityFilter, number>;

// Skipped sources are listed but never counted: they are not work in flight.
export function countsOf(ids: ActivityIds): ActivityCounts {
  const scans = ids.running.length + ids.queue.length;
  const send = ids.entries.length + ids.unsent.length;
  const downloads = ids.downloads.length;
  const sync = ids.sync.length;
  return { all: scans + downloads + send + sync, scans, downloads, send, sync };
}

export function visibleSections(
  ids: ActivityIds,
  filter: ActivityFilter,
): ActivitySection[] {
  return SECTIONS.filter(
    (section) =>
      ids[section].length > 0 &&
      (filter === "all" || SECTION_FILTER[section] === filter),
  );
}

export type ActivityRow =
  | { kind: "header"; key: string; section: ActivitySection; count: number }
  | {
      kind: "item";
      key: string;
      section: ActivitySection;
      id: string;
      index: number;
      count: number;
    };

// Keys carry the section: one manga can sit in two sections at once.
export function toRows(
  ids: ActivityIds,
  filter: ActivityFilter,
): ActivityRow[] {
  return visibleSections(ids, filter).flatMap((section): ActivityRow[] => {
    const list = ids[section];
    return [
      { kind: "header", key: `header-${section}`, section, count: list.length },
      ...list.map(
        (id, index): ActivityRow => ({
          kind: "item",
          key: `${section}:${id}`,
          section,
          id,
          index,
          count: list.length,
        }),
      ),
    ];
  });
}

export function headerIndices(rows: ActivityRow[]): number[] {
  return rows.flatMap((row, index) => (row.kind === "header" ? [index] : []));
}

// A status card over no rows still counts as "filter": the screen shows
// "Nothing here" under it, never the global empty state.
export function emptyKind(
  ids: ActivityIds,
  filter: ActivityFilter,
  statusShown: boolean,
): "all" | "filter" | null {
  if (visibleSections(ids, "all").length === 0 && !statusShown) return "all";
  return visibleSections(ids, filter).length === 0 ? "filter" : null;
}
