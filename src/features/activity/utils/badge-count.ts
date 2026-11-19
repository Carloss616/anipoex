import { unsyncedSummary } from "@/features/sync/state/unsynced";
import { network$ } from "@/state/network";
import { pendingCount } from "./state";

/**
 * What the Settings badges count: each AniList change, and the gist as one
 * when it waits for the connection. A folder syncs offline, so it never counts.
 */
export const badgeCount = () =>
  pendingCount() +
  (!network$.online.get() && unsyncedSummary("gist") !== "" ? 1 : 0);
