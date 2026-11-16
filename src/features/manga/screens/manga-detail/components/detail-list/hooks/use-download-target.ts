import { useEffect } from "react";
import { refreshDownloaded } from "@/features/downloads";
import {
  isRuntimeAvailable,
  useAllInstalledSources,
} from "@/features/extensions";
import { useSourceMatch } from "@/features/manga/hooks/use-source-match";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { noop } from "@/utils/utils";

/**
 * What a chapter row files its download under, as objects that change only
 * with their fields. No source in a plain browser, which can't download.
 */
export function useDownloadTarget(manga: MangaDetail) {
  const { match } = useSourceMatch(manga.id);
  const sources = useAllInstalledSources();
  const found = isRuntimeAvailable
    ? sources.find((entry) => entry.id === match?.sourceId)
    : undefined;
  const sourceId = found?.id;
  const sourceName = found?.name;
  const { id } = manga;
  const title = manga.title?.userPreferred ?? "";
  const cover = manga.coverImage?.large ?? undefined;

  useEffect(() => {
    if (sourceId) refreshDownloaded(id, sourceId).catch(noop);
  }, [id, sourceId]);

  return {
    downloadManga: { id, title, cover },
    downloadSource:
      sourceId && sourceName ? { id: sourceId, name: sourceName } : undefined,
  };
}
