import { split, waitingIds } from "@/features/activity/utils/state";
import { downloadQueue$, downloadsPaused$ } from "@/features/downloads";
import { activeScans$ } from "@/features/manga/state/active-scans";
import { network$ } from "@/state/network";
import { labelFor } from "./label-for";

const downloadsLeft = () =>
  Object.values(downloadQueue$.get()).filter(
    (d) => d.state === "queued" || d.state === "running",
  ).length;

/** The Settings row's status line. */
export const activityLabel = () =>
  labelFor({
    online: network$.online.get(),
    waiting: split(waitingIds()).length,
    paused: downloadsPaused$.get(),
    downloadsLeft: downloadsLeft(),
    scans: Object.keys(activeScans$.get(true)).length,
  });
