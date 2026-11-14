import { observable } from "@legendapp/state";
import { activeScans$ } from "@/features/manga/state/active-scans";
import {
  readingQueue$,
  readingRun$,
} from "@/features/manga/state/reading-queue";

/** The running manga whose sources show, by manga id; not persisted. */
export const expanded$ = observable<Record<string, boolean>>({});

export const toggleExpanded = (mangaId: number) =>
  expanded$[mangaId].set((open) => !open);

/** Whether anything runs: a scan of any manga, or the Reading scan. */
export const hasActivity = () =>
  Object.keys(activeScans$.get(true)).length > 0 ||
  readingRun$.get(true) != null;

/** The running manga's ids, joined: changes only when one starts or ends. */
export const runningIds = () => Object.keys(activeScans$.get(true)).join();

/** The queued manga's ids in order, joined. */
export const queuedIds = () =>
  Object.values(readingQueue$.get())
    .filter((m) => m.state === "queued")
    .sort((a, b) => a.order - b.order)
    .map((m) => m.id)
    .join();

/** The sources skipped as slow, joined. */
export const skippedIds = () =>
  Object.keys(readingRun$.skipped.get(true) ?? {}).join();

export const split = (ids: string) => (ids ? ids.split(",") : []);

/**
 * A segmented row's place reduced to its corners (first, middle, last, only),
 * so a row re-renders only when its corners change, not on every shift.
 */
export function corners(i: number, n: number) {
  if (n === 1) return { index: 0, count: 1 };
  if (i === 0) return { index: 0, count: 2 };
  return i === n - 1 ? { index: 1, count: 2 } : { index: 1, count: 3 };
}
