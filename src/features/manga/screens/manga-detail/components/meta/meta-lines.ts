import { PUBLICATION_STATUSES } from "@/features/manga/constants";
import type { MangaDetail } from "@/features/manga/utils/to-detail";

/** The text beside the cover: other titles, and publication status with year. */
export function metaLines(manga: MangaDetail) {
  const title = manga.title?.userPreferred?.toLowerCase();
  const synonyms = manga.synonyms
    ?.filter((s) => s && s.toLowerCase() !== title)
    .join(" · ");
  const state = [
    manga.status ? PUBLICATION_STATUSES[manga.status] : undefined,
    manga.startDate?.year,
  ]
    .filter(Boolean)
    .join(" · ");

  return { synonyms, state };
}
