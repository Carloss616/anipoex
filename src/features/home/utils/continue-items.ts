import type { ReadingPosition } from "@/features/manga/state/reading-positions";
import type { StoredChapters } from "@/features/manga/utils/chapter-storage/chapter-storage";
import { continueChapter } from "@/features/manga/utils/next-chapter";
import {
  livePosition,
  resolvePosition,
} from "@/features/manga/utils/reading-position";
import type { SourceMatch } from "@/features/manga/utils/source-match";
import {
  type Chapter,
  toChapters,
  unreadCount,
} from "@/features/manga/utils/to-chapters";

/** `latest`: the newest chapter's upload time, in ms. */
export interface ContinueItem {
  mangaId: number;
  unread: number;
  next: Chapter;
  latest: number;
}

/**
 * Started mangas whose matched source page has chapters past their progress,
 * or a chapter being read, newest upload first.
 */
export function continueItems({
  matches,
  stored,
  progress,
  positions = {},
}: {
  matches: Record<number, SourceMatch | undefined>;
  stored: Record<number, StoredChapters | undefined>;
  progress: Record<number, number | undefined>;
  positions?: Record<number, ReadingPosition | undefined>;
}): ContinueItem[] {
  const items: ContinueItem[] = [];
  for (const [key, match] of Object.entries(matches)) {
    const mangaId = Number(key);
    const list = stored[mangaId];
    const read = progress[mangaId];
    // A list stored for the page the match pointed to before is stale.
    if (!match?.manga || !list || list.manga.url !== match.manga.url) continue;
    const chapters = toChapters(list.chapters, list.manga.title);
    const reading = resolvePosition(
      livePosition(positions[mangaId], read ?? 0),
      match.sourceId,
      chapters,
    )?.chapter;
    if (!read && !reading) continue;
    const next = reading ?? continueChapter(chapters, read ?? 0);
    if (!next) continue;
    items.push({
      mangaId,
      unread: unreadCount(chapters, read ?? 0),
      next,
      latest: Math.max(...list.chapters.map((chapter) => chapter.dateUpload)),
    });
  }
  return items.sort((a, b) => b.latest - a.latest);
}
