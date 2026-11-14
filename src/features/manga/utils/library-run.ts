import type { ScanResult } from "../state/probes";
import { mediaKey, type ProbeMap } from "./msu";
import type { ScanActivity, ScanActivityArgs } from "./scan-activity";

export interface LibraryEntry {
  mangaId: number;
  name: string;
  cover?: string;
  read: number;
  /** A retry: only these sources, with no time limit. */
  only?: string[];
}

export interface LibraryQueue<E extends LibraryEntry = LibraryEntry> {
  /** The next manga, now running; undefined when none is queued. */
  next(): E | undefined;
  /** How many are still queued. */
  left(): number;
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
  withNew: { mangaId: number; cover?: string; unread: number }[];
}

/** Starts a manga's scan activity, as `startScanActivity` does. */
export type StartActivity = (args: ScanActivityArgs) => ScanActivity;

export interface LibraryActivity {
  manga(args: {
    entry: LibraryEntry;
    index: number;
    /** Manga started so far plus those still queued. */
    total: number;
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

/** The manga with the most new chapters first, the first `count`, and how many more. */
export function topNew(withNew: LibrarySummary["withNew"], count = 3) {
  const top = [...withNew].sort((a, b) => b.unread - a.unread).slice(0, count);
  return { top, more: withNew.length - top.length };
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
 * Scans the queue in order, taking each manga as it starts, each starting once the one before is down to
 * its last `TAIL_SOURCES` sources, up to `OVERLAP` at once: the slowest
 * sources no longer hold up the list.
 */
export async function runLibrary<E extends LibraryEntry>(args: {
  queue: LibraryQueue<E>;
  scan: (entry: E, activity: StartActivity) => Promise<ScanResult>;
  unread: (entry: E) => number;
  activity: LibraryActivity;
  stopped: () => boolean;
  /** The sources the run skipped as slow, id to name; read at the end. */
  skipped?: Map<string, string>;
}): Promise<{
  summary: LibrarySummary;
  picks: LibraryPick[];
}> {
  const { queue, scan, unread, activity, stopped } = args;
  const summary: LibrarySummary = {
    total: 0,
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
    for (let i = 0; ; i++) {
      await runs[i - OVERLAP];
      if (stopped()) break;
      let next = queue.next();
      if (!next) {
        // A retry may queue more while the last ones finish.
        await Promise.all(runs);
        next = stopped() ? undefined : queue.next();
        if (!next) break;
      }
      const entry = next;
      const slot = i;
      supersede?.();
      let tail!: () => void;
      const tailed = new Promise<void>((resolve) => {
        tail = resolve;
      });
      const start = activity.manga({
        entry,
        index: i + 1,
        total: i + 1 + queue.left(),
        newSoFar: summary.withNew.length,
      });
      let shown = true;
      let left = 0;
      const finishing = () => {
        if (left) behind.set(slot, { name: entry.name, left });
        else behind.delete(slot);
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
          const n = unread(entry);
          if (n > 0)
            summary.withNew.push({
              mangaId: entry.mangaId,
              cover: entry.cover,
              unread: n,
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
    summary.total = runs.length + queue.left();
    // Where the stop came: the newest manga started, maybe the last one.
    if (stopped()) summary.stoppedAt = runs.length;
    if (args.skipped?.size) summary.skipped = [...args.skipped.values()];
  } finally {
    activity.end(summary);
  }
  return { summary, picks };
}
