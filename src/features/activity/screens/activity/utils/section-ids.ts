import { unsentIds, waitingIds } from "@/features/activity/utils/state";
import type { ActivitySection } from "./filters";
import { downloadIds, queuedIds, runningIds, skippedIds } from "./state";
import { syncKeys } from "./sync-keys";

/** Each section's ids, joined. */
export const SECTION_IDS: Record<ActivitySection, () => string> = {
  running: runningIds,
  queue: queuedIds,
  downloads: downloadIds,
  skipped: skippedIds,
  entries: waitingIds,
  unsent: unsentIds,
  sync: syncKeys,
};
