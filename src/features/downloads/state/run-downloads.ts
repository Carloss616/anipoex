import { batch } from "@legendapp/state";
import { runtime } from "@/features/extensions/runtime";
import { currentStore } from "../utils/current-store";
import {
  type DownloadDeps,
  downloadChapter,
  PAUSE,
} from "../utils/download-chapter";
import { chapterHash, stageId } from "../utils/paths";
import {
  cancel,
  downloaded$,
  downloadProgress$,
  downloadQueue$,
  downloadStops,
  downloadsOffline$,
  downloadsPaused$,
  downloadsSuspended$,
  queuedOf,
} from "./download-queue";

/** What downloads run on; tests swap them in place. */
export const downloadDeps: Pick<DownloadDeps, "runtime" | "store"> = {
  runtime,
  store: currentStore,
};

const loops = new Map<string, Promise<void>>();
let runId = 0;
/** Pages each paused chapter staged; the stage is a cache, so only this session's. */
const staged = new Map<string, { done: number; count: number }>();

const running = () =>
  Object.values(downloadQueue$.peek()).filter((e) => e.state === "running");

/** One loop per source with queued chapters, until it has none left. */
export function startDownloads() {
  if (
    downloadsPaused$.peek() ||
    downloadsSuspended$.peek() ||
    downloadsOffline$.peek()
  )
    return;
  for (const entry of Object.values(downloadQueue$.peek())) {
    const id = entry.source.id;
    if (entry.state !== "queued" || loops.has(id)) continue;
    loops.set(
      id,
      runSource(id, runId).finally(() => {
        loops.delete(id);
        // Picks up chapters queued meanwhile, or a resume during a stale run.
        startDownloads();
      }),
    );
  }
}

async function runSource(sourceId: string, run: number) {
  // A cancel deletes the entry and a pause bumps runId: either way the write is late.
  const live = (key: string) =>
    run === runId && downloadQueue$[key].peek() !== undefined;
  while (run === runId) {
    const item = queuedOf(sourceId)[0];
    if (!item) return;
    const { key } = item;
    const controller = new AbortController();
    downloadStops.set(key, (reason) => controller.abort(reason));
    const from = staged.get(key);
    staged.delete(key);
    let at = from;
    batch(() => {
      downloadQueue$[key].state.set("running");
      downloadQueue$[key].progress.delete();
      downloadProgress$[key].set(from ? from.done / from.count : 0);
    });
    try {
      await downloadChapter(item, {
        ...downloadDeps,
        signal: controller.signal,
        from,
        onProgress: (done, count) => {
          at = { done, count };
          if (run === runId && downloadQueue$[key].state.peek() === "running")
            downloadProgress$[key].set(done / count);
        },
      });
      if (!live(key)) continue;
      batch(() => {
        downloadQueue$[key].delete();
        downloadProgress$[key].delete();
        downloaded$[`${item.manga.id}/${sourceId}`][
          chapterHash(item.chapter.url)
        ].set("local");
      });
    } catch (error) {
      if (controller.signal.reason === PAUSE) {
        // Cancelled while its last page landed: nothing will resume it.
        if (!downloadQueue$[key].peek())
          await downloadDeps.runtime.dropStage(stageId(key)).catch(() => {});
        else if (at) staged.set(key, at);
        continue;
      }
      if (!live(key)) continue;
      const aborted = error instanceof Error && error.name === "AbortError";
      batch(() => {
        downloadProgress$[key].delete();
        downloadQueue$[key].assign(
          aborted
            ? { state: "queued" }
            : {
                state: "failed",
                error: error instanceof Error ? error.message : String(error),
              },
        );
      });
      if (aborted) return;
    } finally {
      downloadStops.delete(key);
    }
  }
}

/** Running chapters go back to the queue now: their loops' late writes are dropped. */
function stopDownloads(paused$: typeof downloadsPaused$) {
  runId++;
  batch(() => {
    paused$.set(true);
    for (const { key } of running()) {
      downloadQueue$[key].state.set("queued");
      downloadProgress$[key].delete();
    }
  });
  for (const stop of downloadStops.values()) stop();
}

export const pauseDownloads = () => stopDownloads(downloadsPaused$);

export function resumeDownloads() {
  downloadsPaused$.set(false);
  startDownloads();
}

export const suspendDownloads = () => stopDownloads(downloadsSuspended$);

/** Leaves a user's pause in place. */
export function unsuspendDownloads() {
  downloadsSuspended$.set(false);
  startDownloads();
}

export const suspendOffline = () => stopDownloads(downloadsOffline$);

/** Leaves a user's pause or a background suspension in place. */
export function resumeOnline() {
  downloadsOffline$.set(false);
  startDownloads();
}

/** Stops a running chapter where it is; its ring keeps that value. */
export function pauseDownload(key: string) {
  if (downloadQueue$[key].state.peek() !== "running") return;
  batch(() => {
    downloadQueue$[key].assign({
      state: "paused",
      progress: downloadProgress$[key].peek() ?? 0,
    });
    downloadProgress$[key].delete();
  });
  downloadStops.get(key)?.(PAUSE);
}

export function resumeDownload(key: string) {
  if (downloadQueue$[key].state.peek() !== "paused") return;
  downloadQueue$[key].state.set("queued");
  startDownloads();
}

/** Removes a chapter from the queue; a paused one also drops its staged pages. */
export function cancelDownload(key: string) {
  const paused = downloadQueue$[key].state.peek() === "paused";
  cancel(key);
  if (!paused) return;
  staged.delete(key);
  void downloadDeps.runtime.dropStage(stageId(key)).catch(() => {});
}

/**
 * At app start: a chapter left running by a killed app starts over, and a
 * paused one's stage, in a cache, is dropped.
 */
export async function resumeQueue() {
  // A running loop owns its "running" entry and its stage.
  if (loops.size > 0) return;
  const stale = running();
  batch(() => {
    for (const { key } of stale) downloadQueue$[key].state.set("queued");
  });
  const paused = Object.values(downloadQueue$.peek()).filter(
    (e) => e.state === "paused",
  );
  await Promise.all(
    [...stale, ...paused].map(({ key }) =>
      downloadDeps.runtime.dropStage(stageId(key)).catch(() => {}),
    ),
  );
}
