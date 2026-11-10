import type { ScanResult } from "../state/probes";
import { mediaKey, type ProbeMap } from "./msu";
import type { ScanActivity } from "./scan-activity";

export interface LibraryEntry {
  mangaId: number;
  name: string;
  cover?: string;
  read: number;
}

export interface LibrarySummary {
  total: number;
  scanned: number;
  recent: number;
  /** How many manga were processed when the run was stopped. */
  stoppedAt?: number;
  withNew: { mangaId: number; cover?: string }[];
}

export interface LibraryActivity {
  manga(args: {
    entry: LibraryEntry;
    index: number;
    newSoFar: number;
  }): ScanActivity;
  end(summary: LibrarySummary): void;
}

const newest = (probes: ProbeMap | undefined) =>
  Math.max(0, ...Object.values(probes ?? {}).map((p) => p.updatedAt));

/** Never-probed manga first, then the stalest. */
export function scanOrder<T extends { mangaId: number }>(
  entries: T[],
  probes: Record<string, ProbeMap>,
): T[] {
  const at = (e: T) => newest(probes[mediaKey(e.mangaId)]);
  return [...entries].sort((a, b) => at(a) - at(b));
}

export function libraryStatus(summary: LibrarySummary): string {
  const { total, scanned, recent, stoppedAt, withNew } = summary;
  return [
    stoppedAt === undefined ? null : `Stopped at ${stoppedAt} of ${total}`,
    withNew.length ? `${withNew.length} with new chapters` : "No new chapters",
    `${scanned} scanned`,
    `${recent} recent`,
  ]
    .filter(Boolean)
    .join(" · ");
}

export async function runLibrary(args: {
  entries: LibraryEntry[];
  scan: (entry: LibraryEntry, activity: ScanActivity) => Promise<ScanResult>;
  unread: (entry: LibraryEntry) => number;
  activity: LibraryActivity;
  stopped: () => boolean;
  onIndex?: (index: number) => void;
}): Promise<{
  summary: LibrarySummary;
  picks: {
    mangaId: number;
    previous: NonNullable<ScanResult["picked"]>["previous"];
  }[];
}> {
  const { entries, scan, unread, activity, stopped, onIndex } = args;
  const summary: LibrarySummary = {
    total: entries.length,
    scanned: 0,
    recent: 0,
    withNew: [],
  };
  const picks: {
    mangaId: number;
    previous: NonNullable<ScanResult["picked"]>["previous"];
  }[] = [];

  try {
    for (const [i, entry] of entries.entries()) {
      if (stopped()) {
        summary.stoppedAt = i;
        break;
      }
      onIndex?.(i + 1);
      const result = await scan(
        entry,
        activity.manga({
          entry,
          index: i + 1,
          newSoFar: summary.withNew.length,
        }),
      );
      if (result.scanned) summary.scanned++;
      else summary.recent++;
      if (result.picked)
        picks.push({
          mangaId: entry.mangaId,
          previous: result.picked.previous,
        });
      if (unread(entry) > 0)
        summary.withNew.push({ mangaId: entry.mangaId, cover: entry.cover });
    }
  } finally {
    activity.end(summary);
  }
  return { summary, picks };
}
