import type { MangaEntry } from "./to-entries";

/**
 * Whether one title or synonym of the manga holds every word of `needle`
 * (lowercased), in any order: "the supreme" finds "The Former Supreme".
 */
export function matchesQuery(manga: MangaEntry, needle: string) {
  const words = needle.split(/\s+/).filter(Boolean);
  // Named fields, not Object.values: the cached title carries `__typename`.
  const { userPreferred, english, romaji, native } = manga.title ?? {};
  return [
    userPreferred,
    english,
    romaji,
    native,
    ...(manga.synonyms ?? []),
  ].some((t) => {
    const title = t?.toLowerCase();
    return title != null && words.every((w) => title.includes(w));
  });
}
