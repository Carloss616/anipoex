import { chapters$, chaptersKey } from "@/features/manga/state/chapters";
import { exclusions$ } from "@/features/manga/state/exclusions";
import { probes$ } from "@/features/manga/state/probes";
import { source$ } from "@/features/manga/state/source";
import { bestLatest } from "@/features/manga/utils/best-source";
import { mediaKey } from "@/features/manga/utils/msu";
import { readMatch } from "@/features/manga/utils/source-match";
import { lastChapterNumber } from "@/features/manga/utils/to-chapters";

/**
 * The chosen source's latest chapter number; with nothing chosen, the best
 * readable source's (a scan's picks stay on its device, its probes sync).
 * Undefined with no match. Reads with `get()`, so it tracks inside a computed.
 */
export function latestChapterOf(mangaId: number): number | undefined {
  // Its probe first: in memory, it follows a source change at once; the
  // stored list only when no probe matched.
  const key = mediaKey(mangaId);
  const match = readMatch(source$[mangaId].get());
  if (!match)
    return bestLatest(exclusions$[key].get() ?? {}, probes$[key].get() ?? {});
  if (!match.manga) return undefined;
  const probe = probes$[key][match.sourceId].get();
  if (probe?.matched) return probe.latest;
  const entry = chapters$[chaptersKey(mangaId, match.sourceId)].get();
  return entry?.manga.url === match.manga.url
    ? lastChapterNumber(entry.chapters)
    : undefined;
}
