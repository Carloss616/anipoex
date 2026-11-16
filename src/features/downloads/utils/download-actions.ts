import type { Chapter } from "@/features/manga/utils/to-chapters";
import { enqueue, type QueuedDownload, retry } from "../state/download-queue";
import { refreshDownloaded } from "../state/downloaded";
import { startDownloads } from "../state/run-downloads";
import { currentStore } from "./current-store";
import type { DownloadStore } from "./download-store";

/** A chapter as the queue stores it. */
export function chapterToQueued(
  manga: QueuedDownload["manga"],
  source: QueuedDownload["source"],
  chapter: Chapter,
): Omit<QueuedDownload, "key" | "order" | "state"> {
  return {
    manga,
    source,
    chapter: {
      url: chapter.id,
      name: chapter.title,
      number: chapter.number,
      scanlator: chapter.scanlator,
      memo: chapter.memo,
    },
  };
}

export function downloadOne(
  manga: QueuedDownload["manga"],
  source: QueuedDownload["source"],
  chapter: Chapter,
) {
  enqueue([chapterToQueued(manga, source, chapter)]);
  startDownloads();
}

export function retryDownload(key: string) {
  retry(key);
  startDownloads();
}

/** Removes every file of each hash, a cloud's conflict copies included. */
export async function deleteDownloads(
  mangaId: number,
  sourceId: string,
  hashes: string[],
  store: DownloadStore | undefined = currentStore(),
) {
  if (!store) return;
  const wanted = new Set(hashes);
  try {
    const files = await store.list(mangaId, sourceId);
    for (const file of files) {
      if (!wanted.has(file.hash)) continue;
      for (const path of file.paths) await store.remove(path);
    }
  } finally {
    // A removal that failed partway still shows what is left.
    await refreshDownloaded(mangaId, sourceId, store);
  }
}
