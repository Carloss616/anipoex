import type { RuntimeApi } from "@/features/extensions";
import type { QueuedDownload } from "../state/download-queue";
import { comicInfo } from "./comic-info";
import type { DownloadStore } from "./download-store";
import { chapterPath, pageName, stageId } from "./paths";

export interface DownloadDeps {
  runtime: Pick<RuntimeApi, "pages" | "stagePage" | "pack" | "dropStage">;
  /** Read at put time, so a root changed mid-download gets the file. */
  store: () => DownloadStore | undefined;
  onProgress(fraction: number): void;
  signal: AbortSignal;
}

const abortError = () =>
  Object.assign(new Error("Download stopped"), { name: "AbortError" });

/**
 * pages → stagePage each → pack → store().put → dropStage. A page error
 * reloads the page list once and resumes at that page; a second error throws.
 */
export async function downloadChapter(
  item: QueuedDownload,
  { runtime, store, onProgress, signal }: DownloadDeps,
) {
  if (!store()) throw new Error("Downloads need the app");
  const { manga, source, chapter } = item;
  const stage = stageId(item.key);
  const load = () =>
    runtime.pages(source.id, chapter.url, chapter.memo ?? undefined);
  try {
    let pages = await load();
    if (pages.length === 0) throw new Error("No pages");
    // A reload can change the count: keep every name the same width.
    const count = pages.length;
    let retried = false;
    for (let i = 0; i < pages.length; i++) {
      if (signal.aborted) throw abortError();
      const name = pageName(i, count);
      try {
        await runtime.stagePage(source.id, pages[i], stage, name);
      } catch (error) {
        if (retried) throw error;
        retried = true;
        // Page urls can expire while a chapter downloads: fetch fresh ones.
        pages = await load();
        if (i >= pages.length) throw error;
        if (signal.aborted) throw abortError();
        await runtime.stagePage(source.id, pages[i], stage, name);
      }
      onProgress((i + 1) / pages.length);
    }
    const uri = await runtime.pack(stage, comicInfo(item));
    // A cancelled chapter must not land in a folder the app never cleans.
    if (signal.aborted) throw abortError();
    const target = store();
    if (!target) throw new Error("Downloads need the app");
    await target.put(chapterPath(manga, source, chapter), uri);
  } finally {
    await runtime.dropStage(stage).catch(() => {});
  }
}
