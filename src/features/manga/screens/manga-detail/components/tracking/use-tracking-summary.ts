import { MANGA_STATUSES } from "@/features/manga/constants";
import { useTrackingEntry } from "@/features/manga/hooks/use-tracking-entry";
import type { MangaDetail } from "@/features/manga/utils/to-detail";

/** The entry as the summary button reads it: status label, progress and percent. */
export function useTrackingSummary(manga: MangaDetail) {
  const tracking = useTrackingEntry(manga.mediaListEntry?.id);

  const status = tracking?.status;
  const label = status && MANGA_STATUSES[status];

  const total = manga.chapters;
  const progress = tracking?.progress ?? 0;
  const ratio = total ? Math.min(progress / total, 1) : 0;
  const percent = Math.round(ratio * 100);

  return { tracking, label, total, progress, percent };
}
