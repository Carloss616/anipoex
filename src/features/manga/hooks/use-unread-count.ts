import { useValue } from "@legendapp/state/react";
import { latestChapterOf } from "@/features/manga/utils/latest-chapter";
import { unreadChapters } from "@/features/manga/utils/source-classify";

/**
 * The chosen source's +N past `progress`, the number its row shows in the
 * source sheet; with nothing chosen, the best readable source's (a scan's
 * picks stay on its device, its probes sync). Undefined with no match or
 * nothing read.
 */
export function useUnreadCount(
  mangaId: number,
  progress: number,
): number | undefined {
  const latest = useValue(() => latestChapterOf(mangaId));
  return latest === undefined ? undefined : unreadChapters(progress, latest);
}
