import {
  downloadsPending,
  pendingCount,
  waitingIds,
} from "@/features/activity/utils/state";
import {
  syncing$,
  syncState$,
  type TargetKey,
} from "@/features/sync/state/engine";
import { unsyncedSummary } from "@/features/sync/state/unsynced";
import { network$ } from "@/state/network";

const targets = () => Object.keys(syncState$.targets.get(true)) as TargetKey[];

/** The connected sync targets, joined. */
export const syncKeys = () => targets().join();

const syncWaits = () =>
  targets().some((key) => syncing$[key].get() || unsyncedSummary(key) !== "");

/** Whether anything waits: a change, a sync or a download. */
export const hasPending = () =>
  pendingCount() > 0 || syncWaits() || downloadsPending();

/** What the status card says; empty when online with nothing to send. */
export const statusMode = () => {
  if (!network$.online.get()) return "offline";
  return waitingIds() !== "" ? "sending" : "";
};
