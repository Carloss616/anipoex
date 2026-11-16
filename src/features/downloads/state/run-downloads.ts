import { batch } from "@legendapp/state";
import { runtime } from "@/features/extensions/runtime";
import { currentStore } from "../utils/current-store";
import { type DownloadDeps, downloadChapter } from "../utils/download-chapter";
import { chapterHash, stageId } from "../utils/paths";
import {
  downloaded$,
  downloadProgress$,
  downloadQueue$,
  downloadStops,
  downloadsPaused$,
  queuedOf,
} from "./download-queue";

/** What downloads run on; tests swap them in place. */
export const downloadDeps: Pick<DownloadDeps, "runtime" | "store"> = {
  runtime,
  store: currentStore,
};

const loops = new Map<string, Promise<void>>();
let runId = 0;

const running = () =>
  Object.values(downloadQueue$.peek()).filter((e) => e.state === "running");

/** One loop per source with queued chapters, until it has none left. */
export function startDownloads() {
  if (downloadsPaused$.peek()) return;
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
    downloadStops.set(key, () => controller.abort());
    batch(() => {
      downloadQueue$[key].state.set("running");
      downloadProgress$[key].set(0);
    });
    try {
      await downloadChapter(item, {
        ...downloadDeps,
        signal: controller.signal,
        onProgress: (fraction) => {
          if (live(key)) downloadProgress$[key].set(fraction);
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
export function pauseDownloads() {
  runId++;
  batch(() => {
    downloadsPaused$.set(true);
    for (const { key } of running()) {
      downloadQueue$[key].state.set("queued");
      downloadProgress$[key].delete();
    }
  });
  for (const stop of downloadStops.values()) stop();
}

export function resumeDownloads() {
  downloadsPaused$.set(false);
  startDownloads();
}

/** At app start: a chapter left running by a killed app starts over. */
export async function resumeQueue() {
  // A running loop owns its "running" entry and its stage.
  if (loops.size > 0) return;
  const stale = running();
  batch(() => {
    for (const { key } of stale) downloadQueue$[key].state.set("queued");
  });
  await Promise.all(
    stale.map(({ key }) =>
      downloadDeps.runtime.dropStage(stageId(key)).catch(() => {}),
    ),
  );
}
