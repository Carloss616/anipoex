import type { SourceManga } from "@/features/extensions";
import type { MangaDetail } from "./to-detail";

// Sources search Latin text; native or Cyrillic synonyms rarely find any.
const LATIN = /^[\p{Script=Latin}\p{N}\p{P}\p{S}\s]+$/u;
// Each query can wait the whole timeout, once per source in a scan.
const MAX_QUERIES = 5;

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

// A tag of only these words marks an edition of the same manga. Any other
// tag can name another work: "One-punch Man (ONE)" is the webcomic.
const EDITION = new Set(["official", "colored", "coloured", "remake"]);

const dropEditionTags = (title: string) =>
  title.replace(/[([]([^)\]]*)[)\]]/g, (tag, inner: string) =>
    normalizeTitle(inner)
      .split(" ")
      .every((word) => EDITION.has(word))
      ? " "
      : tag,
  );

/**
 * An equal title first, then one equal without an edition tag like
 * "(Official Colored)". Never a near match: a fuzzy score accepts "Monsters"
 * for "Monster" or a sequel's "2", and lists the wrong manga's chapters. Nor a
 * tag that equals a title: fan comics read "odio amarte (one punch man)".
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
    results.find((result) => equal(dropEditionTags(result.title))) ??
    null
  );
}

// A suggestion only, never taken: at this score sequels and spin-offs pass too.
const SIMILAR = 0.7;

const bigrams = (title: string) => {
  const text = normalizeTitle(title).replace(/ /g, "");
  const counts = new Map<string, number>();
  for (let i = 0; i < text.length - 1; i++) {
    const pair = text.slice(i, i + 2);
    counts.set(pair, (counts.get(pair) ?? 0) + 1);
  }
  return { counts, size: Math.max(0, text.length - 1) };
};

/** Sørensen–Dice over letter pairs, 0 to 1. */
function similarity(
  x: ReturnType<typeof bigrams>,
  y: ReturnType<typeof bigrams>,
) {
  if (x.size + y.size === 0) return 0;
  let shared = 0;
  for (const [pair, n] of x.counts)
    shared += Math.min(n, y.counts.get(pair) ?? 0);
  return (2 * shared) / (x.size + y.size);
}

/**
 * The result closest to a title, to suggest when none equals one; nothing
 * when one does or none comes close.
 */
export function bestSimilar(
  results: SourceManga[],
  titles: (string | null | undefined)[],
): SourceManga | undefined {
  const known = titles.filter((title): title is string => !!title);
  if (pickMatch(results, known)) return undefined;
  const pairs = known.map(bigrams);
  let best: { manga: SourceManga; score: number } | undefined;
  for (const manga of results) {
    const own = bigrams(manga.title);
    const score = Math.max(0, ...pairs.map((pair) => similarity(own, pair)));
    if (score >= SIMILAR && score > (best?.score ?? 0)) best = { manga, score };
  }
  return best?.manga;
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

/**
 * What follows a title's first colon ("Mookhyang: Dark Lady" → "Dark Lady"),
 * a name some sources list it under. Only of two words or more: a one-word
 * subtitle is often a sequel's ("Solo Leveling: Ragnarok") and names another
 * work on its own.
 */
const subtitlesOf = (titles: (string | null | undefined)[]) =>
  titles.flatMap((title) => {
    const after = title?.split(":").slice(1).join(":").trim();
    return after && normalizeTitle(after).split(" ").length >= 2 ? [after] : [];
  });

const queries = (titles: (string | null | undefined)[]) =>
  uniqueTitles(titles).slice(0, MAX_QUERIES);

/**
 * `aliases`: titles the manga's manual matches gave it on other sources, which
 * sources often list under a translated name AniList doesn't have.
 */
export function searchTitles(
  { title, synonyms }: Pick<MangaDetail, "title" | "synonyms">,
  aliases: string[] = [],
): Titles {
  const latin = (text: string | null | undefined) => !!text && LATIN.test(text);
  const latinSynonyms = (synonyms ?? []).filter(latin);
  const subtitles = subtitlesOf([
    title?.romaji,
    title?.english,
    ...latinSynonyms,
  ]);
  return {
    search: queries([
      title?.romaji,
      title?.english,
      ...subtitles,
      ...aliases.filter(latin),
      ...latinSynonyms,
    ]),
    all: [
      title?.romaji,
      title?.english,
      title?.userPreferred,
      title?.native,
      ...(synonyms ?? []),
      ...subtitles,
      ...aliases,
    ],
  };
}
