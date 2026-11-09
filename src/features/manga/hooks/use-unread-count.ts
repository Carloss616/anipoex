import { useValue } from "@legendapp/state/react";
import { chapters$, chaptersKey } from "@/features/manga/state/chapters";
import { probes$ } from "@/features/manga/state/probes";
import { source$ } from "@/features/manga/state/source";
import { mediaKey } from "@/features/manga/utils/msu";
import { unreadChapters } from "@/features/manga/utils/source-classify";
import { readMatch } from "@/features/manga/utils/source-match";
import { lastChapterNumber } from "@/features/manga/utils/to-chapters";

/**
 * The chosen source's +N past `progress`, the number its row shows in the
 * source sheet; undefined with no source, no match, or nothing read from it.
 */
export function useUnreadCount(
  mangaId: number,
  progress: number,
): number | undefined {
  // Its probe first: in memory, it follows a source change at once; the
  // stored list only when no probe matched.
  const latest = useValue(() => {
    const match = readMatch(source$[mangaId].get());
    if (!match?.manga) return undefined;
    const probe = probes$[mediaKey(mangaId)][match.sourceId].get();
    if (probe?.matched) return probe.latest;
    const entry = chapters$[chaptersKey(mangaId, match.sourceId)].get();
    return entry?.manga.url === match.manga.url
      ? lastChapterNumber(entry.chapters)
      : undefined;
  });
  return latest === undefined ? undefined : unreadChapters(progress, latest);
}
