import type { MenuAction, MenuSubmenu } from "@/components/ui/menu";
import type { Chapter } from "@/features/manga/utils/to-chapters";
import { enqueue as enqueueDownloads } from "../state/download-queue";
import { startDownloads } from "../state/run-downloads";
import { chapterToQueued, deleteDownloads } from "./download-actions";
import {
  type DownloadPick,
  pickChapters,
  preferredScanlator,
} from "./pick-chapters";

const PICKS: { label: string; pick: DownloadPick }[] = [
  { label: "Next chapter", pick: "next" },
  { label: "Next 5", pick: "next5" },
  { label: "Next 10", pick: "next10" },
  { label: "Unread", pick: "unread" },
  { label: "All", pick: "all" },
];

export interface DownloadMenuArgs {
  manga: { id: number; title: string; cover?: string };
  source: { id: string; name: string };
  /** Newest first, as the source lists them. */
  chapters: Chapter[];
  progress: number;
  downloadedHashes: Set<string>;
  notify?: (message: string) => void;
  enqueue?: typeof enqueueDownloads;
  start?: () => void;
  remove?: typeof deleteDownloads;
}

export function downloadMenu({
  manga,
  source,
  chapters,
  progress,
  downloadedHashes,
  notify,
  enqueue = enqueueDownloads,
  start = startDownloads,
  remove = deleteDownloads,
}: DownloadMenuArgs): MenuSubmenu {
  const scanlator = preferredScanlator(chapters, progress, downloadedHashes);

  const items: MenuAction[] = PICKS.map(({ label, pick }) => {
    const picked = pickChapters(
      chapters,
      pick,
      progress,
      downloadedHashes,
      scanlator,
    );
    return {
      label,
      disabled: picked.length === 0,
      onPress: () => {
        const n = enqueue(
          picked.map((chapter) => chapterToQueued(manga, source, chapter)),
        );
        if (n === 0) return;
        start();
        notify?.(`Downloading ${n} chapter${n === 1 ? "" : "s"}`);
      },
    };
  });

  items.push({
    label: "Delete downloads",
    destructive: true,
    disabled: downloadedHashes.size === 0,
    onPressMode: "dialog",
    dialogConfig: {
      title: "Delete downloads?",
      description: "Removes this manga's downloaded chapters from this source.",
      confirmLabel: "Delete",
    },
    onPress: () => void remove(manga.id, source.id, [...downloadedHashes]),
  });

  return { label: "Download", items };
}
