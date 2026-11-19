import { downloadsPending, waitingIds } from "@/features/activity/utils/state";
import { downloadsPaused$ } from "@/features/downloads";
import { activeScans$ } from "@/features/manga/state/active-scans";
import { readingRun$ } from "@/features/manga/state/reading-queue";
import { network$ } from "@/state/network";
import { toStatusMode } from "./status";

/** What the status card says about the whole queue; "" when nothing to tell. */
export const statusMode = () =>
  toStatusMode({
    online: network$.online.get(),
    sending: waitingIds() !== "",
    paused: downloadsPaused$.get(),
    queued: downloadsPending(),
    reading: readingRun$.get(true) != null,
    scans: Object.keys(activeScans$.get(true)).length > 0,
  });
