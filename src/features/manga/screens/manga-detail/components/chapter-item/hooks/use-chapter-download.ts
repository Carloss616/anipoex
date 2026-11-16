import { useValue } from "@legendapp/state/react";
import { toast } from "@/components/ui/toast";
import {
  cancel,
  chapterHash,
  deleteDownloads,
  downloadKey,
  downloadOne,
  downloadStateOf,
  type QueuedDownload,
  retryDownload,
} from "@/features/downloads";
import type { Chapter } from "@/features/manga/utils/to-chapters";
import { type DownloadActions, downloadItems } from "../utils/download-items";

/**
 * The chapter's download state, which re-renders the row only when it
 * changes, and what each state's actions do.
 */
export function useChapterDownload(
  manga: QueuedDownload["manga"],
  source: QueuedDownload["source"] | undefined,
  chapter: Chapter,
) {
  const state = useValue(() =>
    source ? downloadStateOf(manga.id, source.id, chapter.id) : "none",
  );
  const hash = chapterHash(chapter.id);
  const key = source ? downloadKey(manga.id, source.id, hash) : "";
  const actions: DownloadActions = {
    download: () => {
      if (source) downloadOne(manga, source, chapter);
    },
    cancel: () => cancel(key),
    retry: () => retryDownload(key),
    remove: () => {
      if (!source) return;
      deleteDownloads(manga.id, source.id, [hash]).catch(() =>
        toast.error("Couldn't delete the download"),
      );
    },
  };
  /** What the row's button does; local and cloud open its menu instead. */
  const press =
    state === "none"
      ? actions.download
      : state === "failed"
        ? actions.retry
        : actions.cancel;

  return {
    state,
    key,
    actions,
    press,
    items: source ? downloadItems(state, actions) : [],
  };
}
