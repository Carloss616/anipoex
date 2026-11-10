import type { ScanResult } from "../state/probes";
import { mediaKey, type ProbeMap } from "./msu";
import type { ScanActivity, ScanActivityArgs } from "./scan-activity";

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
  /** Manga whose source the run picked. */
  picked: number;
  /** Sources left out of the rest of the run for reading too slowly. */
  skipped?: string[];
  /** How many manga were processed when the run was stopped. */
  stoppedAt?: number;
  withNew: { mangaId: number; cover?: string }[];
}

/** Starts a manga's scan activity, as `startScanActivity` does. */
export type StartActivity = (args: ScanActivityArgs) => ScanActivity;

export interface LibraryActivity {
  manga(args: {
    entry: LibraryEntry;
    index: number;
    newSoFar: number;
  }): StartActivity;
  /** The manga still finishing behind the one shown; undefined once none is. */
  finishing(line: string | undefined): void;
  end(summary: LibrarySummary): void;
}

type LibraryPick = { mangaId: number } & NonNullable<ScanResult["picked"]>;

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
  const { total, recent, picked, skipped, stoppedAt, withNew } = summary;
  return [
    stoppedAt === undefined ? null : `Stopped at ${stoppedAt} of ${total}`,
    withNew.length ? `${withNew.length} with new chapters` : "No new chapters",
    picked > 0 && `${picked} source${picked > 1 ? "s" : ""} picked`,
    recent > 0 && `${recent} checked recently`,
    skipped?.length && `Skipped slow: ${skipped.join(", ")}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** The next manga starts when the one before has this many sources left. */
export const TAIL_SOURCES = 2;
/** Manga scanned at once: the one shown and those finishing behind it. */
export const OVERLAP = 4;

/** The manga finishing behind the one shown, in one line. */
function finishingLine(behind: { name: string; left: number }[]) {
  const rows = behind.filter((m) => m.left > 0);
  if (rows.length === 0) return undefined;
  if (rows.length === 1)
    return `Finishing ${rows[0].name} · ${rows[0].left} left`;
  const left = rows.reduce((sum, m) => sum + m.left, 0);
  return `Finishing ${rows.length} manga · ${left} sources left`;
}

/**
 * Scans the entries in order, each starting once the one before is down to
 * its last `TAIL_SOURCES` sources, up to `OVERLAP` at once: the slowest
 * sources no longer hold up the list.
 */
export async function runLibrary(args: {
  entries: LibraryEntry[];
  scan: (entry: LibraryEntry, activity: StartActivity) => Promise<ScanResult>;
  unread: (entry: LibraryEntry) => number;
  activity: LibraryActivity;
  stopped: () => boolean;
  /** The sources the run skipped as slow, id to name; read at the end. */
  skipped?: Map<string, string>;
}): Promise<{
  summary: LibrarySummary;
  picks: LibraryPick[];
}> {
  const { entries, scan, unread, activity, stopped } = args;
  const summary: LibrarySummary = {
    total: entries.length,
    scanned: 0,
    recent: 0,
    picked: 0,
    withNew: [],
  };
  const picks: LibraryPick[] = [];
  const runs: Promise<void>[] = [];
  // Hands the view over when the next manga starts.
  let supersede: (() => void) | undefined;
  const behind = new Map<number, { name: string; left: number }>();
  const showBehind = () =>
    activity.finishing(finishingLine([...behind.values()]));

  try {
    for (const [i, entry] of entries.entries()) {
      await runs[i - OVERLAP];
      if (stopped()) break;
      supersede?.();
      let tail!: () => void;
      const tailed = new Promise<void>((resolve) => {
        tail = resolve;
      });
      const start = activity.manga({
        entry,
        index: i + 1,
        newSoFar: summary.withNew.length,
      });
      let shown = true;
      let left = 0;
      const finishing = () => {
        if (left) behind.set(i, { name: entry.name, left });
        else behind.delete(i);
        showBehind();
      };
      supersede = () => {
        shown = false;
        finishing();
      };
      // Once superseded, its scan only counts down the finishing line.
      const tracked: StartActivity = (scanArgs) => {
        const inner = start(scanArgs);
        left = scanArgs.total;
        if (left <= TAIL_SOURCES) tail();
        return {
          progress: (done) => {
            left = scanArgs.total - done;
            if (left <= TAIL_SOURCES) tail();
            if (shown) inner.progress(done);
            else finishing();
          },
          mark: (id, mark) => {
            if (shown) inner.mark(id, mark);
          },
          end: (found) => {
            left = 0;
            if (shown) inner.end(found);
            else finishing();
          },
        };
      };
      const run = scan(entry, tracked)
        .then((result) => {
          if (result.scanned) summary.scanned++;
          else if (result.recent) summary.recent++;
          if (result.picked) {
            picks.push({ mangaId: entry.mangaId, ...result.picked });
            summary.picked++;
          }
          if (unread(entry) > 0)
            summary.withNew.push({
              mangaId: entry.mangaId,
              cover: entry.cover,
            });
        })
        .finally(tail);
      // Awaited below; handled now so a failure while the next runs isn't
      // reported as unhandled.
      run.catch(() => {});
      runs.push(run);
      await tailed;
    }
    await Promise.all(runs);
    // Where the stop came: the newest manga started, maybe the last one.
    if (stopped()) summary.stoppedAt = runs.length;
    if (args.skipped?.size) summary.skipped = [...args.skipped.values()];
  } finally {
    activity.end(summary);
  }
  return { summary, picks };
}
