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

export function applyListOptions(
  entries: MangaEntry[],
  { filters, sort }: ListOptions,
  { fields, latest, downloaded }: ListLookups,
): MangaEntry[] {
  const progress = (entry: MangaEntry) => fields[entry.id]?.progress ?? 0;
  const unread = (entry: MangaEntry) => {
    const last = latest(entry.id);
    return last === undefined
      ? undefined
      : unreadChapters(progress(entry), last);
  };
  const title = (entry: MangaEntry) => entry.title?.userPreferred || undefined;

  const value = (entry: MangaEntry): number | string | undefined => {
    switch (sort.by) {
      case "title":
        return title(entry);
      case "unread":
        return unread(entry);
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

  const compareTitles = (a: MangaEntry, b: MangaEntry) => {
    const [x, y] = [title(a), title(b)];
    if (x === undefined || y === undefined) {
      return Number(x === undefined) - Number(y === undefined);
    }
    return x.localeCompare(y, undefined, { sensitivity: "base" });
  };

  const compare = (a: MangaEntry, b: MangaEntry) => {
    const [x, y] = [value(a), value(b)];
    // Missing data goes last in both directions, so it ignores the direction.
    if (x === undefined || y === undefined) {
      const missing = Number(x === undefined) - Number(y === undefined);
      if (missing !== 0) return missing;
    } else {
      const order =
        typeof x === "string" && typeof y === "string"
          ? x.localeCompare(y, undefined, { sensitivity: "base" })
          : Number(x) - Number(y);
      if (order !== 0) return sort.ascending ? order : -order;
    }
    return compareTitles(a, b) || a.id - b.id;
  };

  return entries
    .filter(
      (entry) =>
        passes(filters.unread, (unread(entry) ?? 0) > 0) &&
        passes(filters.started, progress(entry) > 0) &&
        passes(filters.downloaded, downloaded.has(entry.id)) &&
        passes(filters.completed, entry.status === MediaStatus.Finished),
    )
    .toSorted(compare);
}
