import type { RuntimeApi } from "@/features/extensions";
import type { QueuedDownload } from "../state/download-queue";
import { comicInfo } from "./comic-info";
import type { DownloadStore } from "./download-store";
import { chapterPath, pageName, stageId } from "./paths";

export interface DownloadDeps {
  runtime: Pick<RuntimeApi, "pages" | "stagePage" | "pack" | "dropStage">;
  /** Read at put time, so a root changed mid-download gets the file. */
  store: () => DownloadStore | undefined;
  onProgress(done: number, count: number): void;
  signal: AbortSignal;
  /** Pages a paused run staged; reused while the chapter has as many pages. */
  from?: { done: number; count: number };
}

/** The abort reason of a pause, which keeps the staged pages. */
export const PAUSE = "pause";

const abortError = () =>
  Object.assign(new Error("Download stopped"), { name: "AbortError" });

/**
 * pages → stagePage each → pack → store().put → dropStage. A page error
 * reloads the page list once and resumes at that page; a second error throws.
 * A pause keeps the stage, so the next run starts after its pages.
 */
export async function downloadChapter(
  item: QueuedDownload,
  { runtime, store, onProgress, signal, from }: DownloadDeps,
) {
  if (!store()) throw new Error("Downloads need the app");
  const { manga, source, chapter } = item;
  const stage = stageId(item.key);
  const load = () =>
    runtime.pages(source.id, chapter.url, chapter.memo ?? undefined);
  let stored = false;
  try {
    let pages = await load();
    if (pages.length === 0) throw new Error("No pages");
    // A reload can change the count: keep every name the same width.
    const count = pages.length;
    const start = from?.count === count ? from.done : 0;
    // A stage of another page count holds names this run won't overwrite.
    if (from && !start) await runtime.dropStage(stage);
    let retried = false;
    const stagePage = (i: number) =>
      runtime
        .stagePage(source.id, pages[i], stage, pageName(i, count))
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : error;
          throw new Error(`Page ${i + 1} of ${pages.length}: ${message}`, {
            cause: error,
          });
        });
    for (let i = start; i < pages.length; i++) {
      if (signal.aborted) throw abortError();
      try {
        await stagePage(i);
      } catch (error) {
        if (retried) throw error;
        retried = true;
        // Page urls can expire while a chapter downloads: fetch fresh ones.
        pages = await load();
        if (i >= pages.length) throw error;
        if (signal.aborted) throw abortError();
        await stagePage(i);
      }
      onProgress(i + 1, pages.length);
    }
    const uri = await runtime.pack(stage, comicInfo(item));
    // A cancelled chapter must not land in a folder the app never cleans.
    if (signal.aborted) throw abortError();
    const target = store();
    if (!target) throw new Error("Downloads need the app");
    await target.put(chapterPath(manga, source, chapter), uri);
    stored = true;
  } finally {
    if (stored || signal.reason !== PAUSE)
      await runtime.dropStage(stage).catch(() => {});
  }
}
