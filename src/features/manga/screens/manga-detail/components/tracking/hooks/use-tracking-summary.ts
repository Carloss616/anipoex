import { useValue } from "@legendapp/state/react";
import { MANGA_STATUSES } from "@/features/manga/constants";
import { useTrackingEntry } from "@/features/manga/hooks/use-tracking-entry";
import { chapters$, chaptersKey } from "@/features/manga/state/chapters";
import { source$ } from "@/features/manga/state/source";
import { readMatch } from "@/features/manga/utils/source-match";
import {
  lastChapterNumber,
  toChapters,
} from "@/features/manga/utils/to-chapters";
import type { MangaDetail } from "@/features/manga/utils/to-detail";

/** The entry as the summary button reads it: status, progress and percent. */
export function useTrackingSummary(manga: MangaDetail) {
  const tracking = useTrackingEntry(manga.mediaListEntry?.id);

  const status = tracking?.status;
  const label = status && MANGA_STATUSES[status];

  // AniList has no total while a manga runs: the selected source's last one.
  const sourceLast = useValue(() => {
    const match = readMatch(source$[manga.id].get());
    if (!match?.manga) return 0;
    const list = chapters$[chaptersKey(manga.id, match.sourceId)].get();
    if (list?.manga.url !== match.manga.url) return 0;
    return lastChapterNumber(toChapters(list.chapters, list.manga.title));
  });
  const total = manga.chapters || sourceLast;
  const progress = tracking?.progress ?? 0;
  const ratio = total ? Math.min(progress / total, 1) : 0;
  const percent = Math.round(ratio * 100);

  return { tracking, label, total, progress, percent };
}
