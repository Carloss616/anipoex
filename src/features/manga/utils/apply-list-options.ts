import { MediaStatus } from "@/graphql/types.generated";
import type { ListOptions, TriState } from "./list-options";
import { unreadChapters } from "./source-classify";
import type { EntryFields, MangaEntry } from "./to-entries";

export interface ListLookups {
  fields: Record<number, EntryFields>;
  latest: (mangaId: number) => number | undefined;
  downloaded: ReadonlySet<number>;
}

/** Whether the options read the latest chapter, which costs a lookup per entry. */
export function needsLatest({ filters, sort }: ListOptions): boolean {
  return (
    filters.unread !== "any" || sort.by === "unread" || sort.by === "chapters"
  );
}

/** Ids with at least one downloaded chapter, from "id/source" keys. */
export function downloadedIds(
  downloaded: Record<string, Record<string, unknown>>,
): Set<number> {
  const ids = new Set<number>();
  for (const [key, chapters] of Object.entries(downloaded)) {
    if (Object.keys(chapters).length > 0) ids.add(Number(key.split("/")[0]));
  }
  return ids;
}

const passes = (state: TriState, value: boolean) =>
  state === "any" || (state === "include") === value;

const collator = new Intl.Collator(undefined, { sensitivity: "base" });

interface Row {
  entry: MangaEntry;
  title: string | undefined;
  value: number | string | undefined;
}

export function applyListOptions(
  entries: MangaEntry[],
  { filters, sort }: ListOptions,
  { fields, latest, downloaded }: ListLookups,
): MangaEntry[] {
  const needsUnread = filters.unread !== "any" || sort.by === "unread";
  const progress = (entry: MangaEntry) => fields[entry.id]?.progress ?? 0;
  const unreadOf = (entry: MangaEntry) => {
    const last = latest(entry.id);
    return last === undefined
      ? undefined
      : unreadChapters(progress(entry), last);
  };

  const value = (
    entry: MangaEntry,
    title: string | undefined,
    unread: number | undefined,
  ) => {
    switch (sort.by) {
      case "title":
        return title;
      case "unread":
        return unread;
      case "chapters":
        return entry.chapters ?? latest(entry.id);
      case "updated":
        return fields[entry.id]?.updatedAt;
      case "added":
        return fields[entry.id]?.createdAt;
      case "score":
        return fields[entry.id]?.score;
    }
  };

  // Each value once per pass: a comparison runs O(n log n) times.
  const rows = entries.flatMap((entry): Row[] => {
    const unread = needsUnread ? unreadOf(entry) : undefined;
    const kept =
      passes(filters.unread, (unread ?? 0) > 0) &&
      passes(filters.started, progress(entry) > 0) &&
      passes(filters.downloaded, downloaded.has(entry.id)) &&
      passes(filters.completed, entry.status === MediaStatus.Finished);
    if (!kept) return [];
    const title = entry.title?.userPreferred || undefined;
    return [{ entry, title, value: value(entry, title, unread) }];
  });

  const compareTitles = (x?: string, y?: string) =>
    x === undefined || y === undefined
      ? Number(x === undefined) - Number(y === undefined)
      : collator.compare(x, y);

  const compare = (a: Row, b: Row) => {
    const [x, y] = [a.value, b.value];
    // Missing data goes last in both directions, so it ignores the direction.
    if (x === undefined || y === undefined) {
      const missing = Number(x === undefined) - Number(y === undefined);
      if (missing !== 0) return missing;
    } else {
      const order =
        typeof x === "string" && typeof y === "string"
          ? collator.compare(x, y)
          : Number(x) - Number(y);
      if (order !== 0) return sort.ascending ? order : -order;
    }
    return compareTitles(a.title, b.title) || a.entry.id - b.entry.id;
  };

  return rows.sort(compare).map((row) => row.entry);
}
