import { useValue } from "@legendapp/state/react";
import { toast } from "@/components/ui/toast";
import {
  cancelDownload,
  chapterHash,
  deleteDownloads,
  downloadKey,
  downloadOne,
  downloadStateOf,
  pauseDownload,
  type QueuedDownload,
  resumeDownload,
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
    cancel: () => cancelDownload(key),
    retry: () => retryDownload(key),
    pause: () => pauseDownload(key),
    resume: () => resumeDownload(key),
    remove: () => {
      if (!source) return;
      deleteDownloads(manga.id, source.id, [hash]).catch(() =>
        toast.error("Couldn't delete the download"),
      );
    },
  };
  /** What the row's button does; local and cloud open its menu instead. */
  const press = {
    none: actions.download,
    queued: actions.cancel,
    running: actions.pause,
    paused: actions.resume,
    failed: actions.retry,
    local: undefined,
    cloud: undefined,
  }[state];

  return {
    state,
    key,
    actions,
    press,
    items: source ? downloadItems(state, actions) : [],
  };
}
