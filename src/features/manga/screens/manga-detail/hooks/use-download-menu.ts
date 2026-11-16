import { useValue } from "@legendapp/state/react";
import { toast } from "@/components/ui/toast";
import { downloaded$ } from "@/features/downloads";
import { downloadMenu } from "@/features/downloads/utils/download-menu";
import { isRuntimeAvailable } from "@/features/extensions";
import { useTrackingEntry } from "@/features/manga/hooks/use-tracking-entry";
import type { SourceMatch } from "@/features/manga/utils/source-match";
import type { Chapter } from "@/features/manga/utils/to-chapters";
import type { MangaDetail } from "@/features/manga/utils/to-detail";

/**
 * The Download submenu; undefined with no source match or no runtime. It reads
 * the downloaded hashes as one joined string, so a progress tick of a running
 * download never re-renders the screen: only a chapter finishing or deleted.
 */
export function useDownloadMenu(
  manga: MangaDetail | undefined,
  chapters: Chapter[],
  match: SourceMatch | undefined,
  sourceName: string,
) {
  const progress = useTrackingEntry(manga?.mediaListEntry?.id)?.progress ?? 0;
  const hashes = useValue(() =>
    match && manga
      ? Object.keys(downloaded$[`${manga.id}/${match.sourceId}`].get() ?? {})
          .sort()
          .join(",")
      : "",
  );

  if (!match || !manga || !isRuntimeAvailable) return undefined;

  return downloadMenu({
    manga: {
      id: manga.id,
      title: manga.title?.userPreferred ?? "",
      cover:
        manga.coverImage?.extraLarge ?? manga.coverImage?.large ?? undefined,
    },
    source: { id: match.sourceId, name: sourceName },
    chapters,
    progress,
    downloadedHashes: new Set(hashes ? hashes.split(",") : []),
    notify: toast,
  });
}
