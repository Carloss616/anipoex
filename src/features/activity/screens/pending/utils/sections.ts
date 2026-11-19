import { syncKeys } from "@/features/activity/screens/activity/utils/sync-keys";
import {
  downloadsPending,
  pendingCount,
  waitingIds,
} from "@/features/activity/utils/state";
import { network$ } from "@/state/network";

export { syncKeys };

const syncWaits = () => syncKeys() !== "";

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
