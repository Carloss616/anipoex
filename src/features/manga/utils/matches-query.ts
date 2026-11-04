import type { MangaEntry } from "./to-entries";

/** Whether a title or synonym of the manga contains `needle` (lowercased). */
export function matchesQuery(manga: MangaEntry, needle: string) {
  // Named fields, not Object.values: the cached title carries `__typename`.
  const { userPreferred, english, romaji, native } = manga.title ?? {};
  return [
    userPreferred,
    english,
    romaji,
    native,
    ...(manga.synonyms ?? []),
  ].some((t) => t?.toLowerCase().includes(needle));
}
