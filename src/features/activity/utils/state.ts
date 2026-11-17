import { downloadQueue$ } from "@/features/downloads";
import { pendingEntries$ } from "@/features/manga/state/pending-entries";

const ids = (failed: boolean) =>
  Object.entries(pendingEntries$.get())
    .filter(([, pending]) => !!pending.error === failed)
    .map(([id]) => id)
    .join();

/** The manga with a change still to be sent, joined. */
export const waitingIds = () => ids(false);

/** The manga whose kept change AniList turned down, joined. */
export const unsentIds = () => ids(true);

/** Every pending AniList change: waiting and not sent. */
export const pendingCount = () => Object.keys(pendingEntries$.get()).length;

/** Whether a download is left to run: queued or running, not only failed ones. */
export const downloadsPending = () =>
  Object.values(downloadQueue$.get()).some((d) => d.state !== "failed");

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
