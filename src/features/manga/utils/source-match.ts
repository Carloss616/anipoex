import type { SourceManga } from "@/features/extensions";

/** The picked source and what it answered: `manga` absent means the search is pending, `null` that it found nothing. */
export interface SourceMatch {
  sourceId: string;
  manga?: { url: string; title: string } | null;
}

function isSourceManga(
  value: unknown,
): value is { url: string; title: string } {
  if (typeof value !== "object" || value === null) return false;
  const { url, title } = value as Record<string, unknown>;
  return typeof url === "string" && typeof title === "string";
}

/** Stored values from before matching are plain source ids, which carry no match. */
export function readMatch(value: unknown): SourceMatch | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const { sourceId, manga } = value as Partial<SourceMatch>;
  if (typeof sourceId !== "string") return undefined;
  if (manga != null && !isSourceManga(manga)) return undefined;
  return value as SourceMatch;
}

/** Case, Latin diacritics and punctuation drop out; kana marks like dakuten stay, so letters and digits of any script compare. */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** Only an equal title counts: a near match would list the wrong manga's chapters. */
export function pickMatch(
  results: SourceManga[],
  titles: (string | null | undefined)[],
): SourceManga | null {
  const wanted = new Set(
    titles.filter((title): title is string => !!title).map(normalizeTitle),
  );
  return (
    results.find((result) => wanted.has(normalizeTitle(result.title))) ?? null
  );
}
