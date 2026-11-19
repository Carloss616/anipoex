import { useValue } from "@legendapp/state/react";
import { useMemo } from "react";
import type { ActivityIds } from "@/features/activity/utils/filters";
import { SECTION_IDS } from "@/features/activity/utils/section-ids";
import { split } from "@/features/activity/utils/state";

/** Each section's ids; changes only when a section's ids change. */
export function useActivityIds(): ActivityIds {
  const running = useValue(SECTION_IDS.running);
  const queue = useValue(SECTION_IDS.queue);
  const downloads = useValue(SECTION_IDS.downloads);
  const skipped = useValue(SECTION_IDS.skipped);
  const entries = useValue(SECTION_IDS.entries);
  const unsent = useValue(SECTION_IDS.unsent);
  const sync = useValue(SECTION_IDS.sync);
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
