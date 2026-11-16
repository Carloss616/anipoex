import type { QueuedDownload } from "../state/download-queue";

export const downloadTitle = (
  manga: string,
  { number, name }: Pick<QueuedDownload["chapter"], "number" | "name">,
) => `${manga} · ${number >= 0 ? `Chapter ${number}` : name || "Chapter"}`;

/** What a downloads activity counted since it started. */
export interface Tally {
  done: number;
  /** Keys that failed since it started and are still failed. */
  failed: string[];
  /** Each entry's state at the last look. */
  states: Record<string, QueuedDownload["state"]>;
}

const statesOf = (queue: Record<string, QueuedDownload>) =>
  Object.fromEntries(Object.values(queue).map((e) => [e.key, e.state]));

/** Entries failed before it are not this run's. */
export const startTally = (queue: Record<string, QueuedDownload>): Tally => ({
  done: 0,
  failed: [],
  states: statesOf(queue),
});

/**
 * Counts what changed since the last look: an entry gone and downloaded is
 * done (a cancelled one is gone too, but not downloaded).
 */
export function tallyQueue(
  tally: Tally,
  queue: Record<string, QueuedDownload>,
  isDownloaded: (key: string) => boolean,
): Tally {
  let { done } = tally;
  for (const key of Object.keys(tally.states))
    if (!queue[key] && isDownloaded(key)) done++;
  const failed = Object.values(queue)
    .filter(
      (e) =>
        e.state === "failed" &&
        (tally.failed.includes(e.key) || tally.states[e.key] !== "failed"),
    )
    .map((e) => e.key);
  return { done, failed, states: statesOf(queue) };
}

/** What the activity shows; none once no chapter is running or queued. */
export function activityView(
  tally: Tally,
  queue: Record<string, QueuedDownload>,
  progress: Record<string, number>,
) {
  const left = Object.values(queue)
    .filter((e) => e.state !== "failed")
    .sort((a, b) => a.order - b.order);
  const current = left.find((e) => e.state === "running") ?? left[0];
  if (!current) return undefined;
  return {
    title: downloadTitle(current.manga.title, current.chapter),
    done: tally.done,
    total: tally.done + tally.failed.length + left.length,
    fraction: progress[current.key] ?? 0,
  };
}

export const countStatus = ({ done, total }: { done: number; total: number }) =>
  `${done} of ${total} downloaded`;

export function endStatus({ done, failed }: { done: number; failed: number }) {
  const downloaded = `${done} chapter${done === 1 ? "" : "s"} downloaded`;
  if (!failed) return downloaded;
  return done ? `${downloaded} · ${failed} failed` : `${failed} failed`;
}
