import type { SourceManga } from "@/features/extensions";
import type { RailState } from "../state/title-search";
import { pickMatch } from "./source-match";

/**
 * The page each source's loaded title results hold that equals a known title,
 * read without searching again; `skip` rules a source out.
 */
export function matchesByTitle(
  rails: Record<string, RailState>,
  titles: (string | null | undefined)[],
  skip: (sourceId: string) => boolean,
): { sourceId: string; manga: SourceManga }[] {
  return Object.entries(rails).flatMap(([sourceId, rail]) => {
    if (rail.status !== "done" || skip(sourceId)) return [];
    const manga = pickMatch(rail.mangas, titles);
    return manga ? [{ sourceId, manga }] : [];
  });
}
