import { useValue } from "@legendapp/state/react";
import { useMemo } from "react";
import type { ActivityIds } from "@/features/activity/screens/activity/utils/filters";
import {
  downloadIds,
  queuedIds,
  runningIds,
  skippedIds,
} from "@/features/activity/screens/activity/utils/state";
import { syncKeys } from "@/features/activity/screens/activity/utils/sync-keys";
import { split, unsentIds, waitingIds } from "@/features/activity/utils/state";

/** Each section's ids; changes only when a section's ids change. */
export function useActivityIds(): ActivityIds {
  const running = useValue(runningIds);
  const queue = useValue(queuedIds);
  const downloads = useValue(downloadIds);
  const skipped = useValue(skippedIds);
  const entries = useValue(waitingIds);
  const unsent = useValue(unsentIds);
  const sync = useValue(syncKeys);
  return useMemo(
    () => ({
      running: split(running),
      queue: split(queue),
      downloads: split(downloads),
      skipped: split(skipped),
      entries: split(entries),
      unsent: split(unsent),
      sync: split(sync),
    }),
    [running, queue, downloads, skipped, entries, unsent, sync],
  );
}
