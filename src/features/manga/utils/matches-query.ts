import type { MangaEntry } from "./to-entries";

/** Whether one of the manga's titles or synonyms contains `needle` (already lowercased). */
export function matchesQuery(manga: MangaEntry, needle: string) {
  // Named fields, not Object.values: the cached title also carries its `__typename`.
  const { userPreferred, english, romaji, native } = manga.title ?? {};
  return [
    userPreferred,
    english,
    romaji,
    native,
    ...(manga.synonyms ?? []),
  ].some((t) => t?.toLowerCase().includes(needle));
}
