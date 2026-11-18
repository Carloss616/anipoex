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

const waits = (key: TargetKey) =>
  !!syncing$[key].get() || unsyncedSummary(key) !== "";

/** The sync targets with something to send or a sync running, joined. */
export const syncKeys = () => targets().filter(waits).join();

const syncWaits = () => targets().some(waits);

/** Downloads wait only offline: online they run, and Activity shows them. */
export const downloadsWait = () => !network$.online.get() && downloadsPending();

/** Whether anything waits: a change, a sync or a download. */
export const hasPending = () =>
  pendingCount() > 0 || syncWaits() || downloadsWait();

/** What the status card says; empty when online with nothing to send. */
export const statusMode = () => {
  if (!network$.online.get()) return "offline";
  return waitingIds() !== "" ? "sending" : "";
};
