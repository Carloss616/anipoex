import type { SourceManga } from "@/features/extensions";
import type { MangaDetail } from "./to-detail";

// Sources search Latin text; native or Cyrillic synonyms rarely find any.
const LATIN = /^[\p{Script=Latin}\p{N}\p{P}\p{S}\s]+$/u;
// Each query can wait the whole timeout, once per source in a scan.
const MAX_QUERIES = 4;

/**
 * The picked source and its answer: `manga` absent means the search is
 * pending, `null` that it found nothing.
 */
export interface SourceMatch {
  sourceId: string;
  manga?: { url: string; title: string; memo?: string | null } | null;
}

function isSourceManga(
  value: unknown,
): value is { url: string; title: string } {
  if (typeof value !== "object" || value === null) return false;
  const { url, title } = value as Record<string, unknown>;
  return typeof url === "string" && typeof title === "string";
}

/** Values stored before matching are plain source ids, with no match. */
export function readMatch(value: unknown): SourceMatch | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const { sourceId, manga } = value as Partial<SourceMatch>;
  if (typeof sourceId !== "string") return undefined;
  if (manga != null && !isSourceManga(manga)) return undefined;
  return value as SourceMatch;
}

/**
 * Drops case, Latin diacritics and punctuation (apostrophes join their word:
 * "Ren'ai" is "renai"); kana marks like dakuten stay, so letters and digits
 * of any script compare.
 */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFC")
    .replace(/['’ʼ`]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/**
 * Also without spaces and romaji long vowels, so "Kaguya-sama … Zunōsen"
 * equals "Kaguyasama … Zunousen".
 */
function titleKey(title: string) {
  return normalizeTitle(title)
    .replace(/ /g, "")
    .replace(/o[ou]/g, "o")
    .replace(/uu/g, "u");
}

/**
 * An equal title first, then one equal without a bracketed tag like
 * "(Official Colored)", unless the tag says novel. Never a near match: a fuzzy
 * score accepts "Monsters" for "Monster" or a sequel's "2", and lists the
 * wrong manga's chapters.
 */
export function pickMatch(
  results: SourceManga[],
  titles: (string | null | undefined)[],
): SourceManga | null {
  const wanted = new Set(
    titles.filter((title): title is string => !!title).map(titleKey),
  );
  wanted.delete("");
  const equal = (title: string) => wanted.has(titleKey(title));
  return (
    results.find((result) => equal(result.title)) ??
    // A "(Novel)" tag stays, so the novel never equals the manga.
    results.find((result) =>
      equal(result.title.replace(/[([](?![^)\]]*novel)[^)\]]*[)\]]/gi, " ")),
    ) ??
    null
  );
}

/** `search`: titles to search by, in order; `all`: titles to match against. */
export interface Titles {
  search: (string | null | undefined)[];
  all: (string | null | undefined)[];
}

/**
 * Titles that differ once normalized, so "Kimetsu no Yaiba" and
 * "KIMETSU NO YAIBA" count once.
 */
export function uniqueTitles(titles: (string | null | undefined)[]) {
  const seen = new Set<string>();
  return titles.filter((title): title is string => {
    const key = title && normalizeTitle(title);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const queries = (titles: (string | null | undefined)[]) =>
  uniqueTitles(titles).slice(0, MAX_QUERIES);

export function searchTitles({
  title,
  synonyms,
}: Pick<MangaDetail, "title" | "synonyms">): Titles {
  return {
    search: queries([
      title?.romaji,
      title?.english,
      ...(synonyms ?? []).filter((synonym) => synonym && LATIN.test(synonym)),
    ]),
    all: [
      title?.romaji,
      title?.english,
      title?.userPreferred,
      title?.native,
      ...(synonyms ?? []),
    ],
  };
}
