import { observe } from "@legendapp/state";
import {
  activityView,
  startTally,
  type Tally,
  tallyQueue,
} from "../utils/activity-view";
import {
  type DownloadActivity,
  startDownloadActivity,
} from "../utils/download-activity";
import {
  downloaded$,
  downloadProgress$,
  downloadQueue$,
  downloadsPaused$,
  downloadsSuspended$,
} from "./download-queue";
import { pauseDownloads } from "./run-downloads";

/** A key is `mangaId/sourceId/hash`; `downloaded$` is `mangaId/sourceId` → hash. */
const isDownloaded = (key: string) => {
  const at = key.lastIndexOf("/");
  return !!downloaded$.peek()[key.slice(0, at)]?.[key.slice(at + 1)];
};

/**
 * Keeps one activity outside the app while a chapter runs or waits and the
 * queue isn't paused; a pause ends it but keeps the count for the resume.
 */
export function syncDownloadActivity() {
  let activity: DownloadActivity | undefined;
  let tally: Tally | undefined;
  return observe(() => {
    const queue = downloadQueue$.get();
    const progress = downloadProgress$.get();
    const paused = downloadsPaused$.get() || downloadsSuspended$.get();
    tally = tally ? tallyQueue(tally, queue, isDownloaded) : startTally(queue);
    const view = activityView(tally, queue, progress);
    if (view && !paused) {
      activity ??= startDownloadActivity(pauseDownloads);
      activity.update(view);
      return;
    }
    activity?.end({
      done: tally.done,
      failed: tally.failed.length,
      paused: !!view,
    });
    activity = undefined;
    if (!view) tally = undefined;
  });
}
