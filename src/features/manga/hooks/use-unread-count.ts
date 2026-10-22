import { useValue } from "@legendapp/state/react";
import { chapters$, chaptersKey } from "@/features/manga/state/chapters";
import { source$ } from "@/features/manga/state/source";
import { readMatch } from "@/features/manga/utils/source-match";
import { toChapters, unreadCount } from "@/features/manga/utils/to-chapters";

/** Chapters past `progress` in the chosen source's stored list; undefined with no source, no match, or no list for the matched page. */
export function useUnreadCount(
  mangaId: number,
  progress: number,
): number | undefined {
  // The entry itself, so the card re-renders only when the list or the match changes.
  const stored = useValue(() => {
    const match = readMatch(source$[mangaId].get());
    if (!match?.manga) return undefined;
    const entry = chapters$[chaptersKey(mangaId, match.sourceId)].get();
    return entry?.manga.url === match.manga.url ? entry : undefined;
  });
  return stored
    ? unreadCount(toChapters(stored.chapters, stored.manga.title), progress)
    : undefined;
}
