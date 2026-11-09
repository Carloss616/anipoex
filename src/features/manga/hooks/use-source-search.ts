import { useInstalledSources } from "@/features/extensions";
import { manualTitles } from "../state/manual-matches";
import { recordProbe } from "../state/probes";
import { resumeSource, selectSource } from "../state/source";
import { searchTitles } from "../utils/source-match";
import type { MangaDetail } from "../utils/to-detail";

/**
 * Searches an installed source for the manga: `select` stores a new pick,
 * `resume` finishes one that has no manga yet.
 */
export function useSourceSearch(
  manga: Pick<MangaDetail, "id" | "title" | "synonyms"> | undefined,
) {
  const sources = useInstalledSources();

  const run =
    (action: typeof selectSource | typeof resumeSource) =>
    async (sourceId: string) => {
      const source = sources.find((entry) => entry.id === sourceId);
      if (!manga || !source) return;
      const found = await action(
        manga.id,
        source,
        searchTitles(manga, manualTitles(manga.id)),
      );
      // No match or a failure loads no chapters: its probe is recorded here.
      if (found === null) recordProbe(manga.id, source, "no-match");
      else if (found && "error" in found) recordProbe(manga.id, source, found);
    };

  return { select: run(selectSource), resume: run(resumeSource) };
}
