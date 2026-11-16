import { useAllInstalledSources } from "@/features/extensions";
import { manualTitles } from "../state/manual-matches";
import { autoPick, recordProbe } from "../state/probes";
import { resumeSource, selectSource, source$ } from "../state/source";
import { searchTitles } from "../utils/source-match";
import type { MangaDetail } from "../utils/to-detail";

/**
 * Searches an installed source for the manga: `select` stores a new pick,
 * `resume` finishes one that has no manga yet, `pick` takes the best source
 * by its stored probes when nothing is chosen.
 */
export function useSourceSearch(
  manga: Pick<MangaDetail, "id" | "title" | "synonyms"> | undefined,
) {
  const sources = useAllInstalledSources();

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

  // Another device's scan picks stay there, but its probes come along.
  const pick = () => {
    if (!manga || source$[manga.id].peek() !== undefined) return;
    autoPick(manga.id, sources, searchTitles(manga, manualTitles(manga.id)));
  };

  return { select: run(selectSource), resume: run(resumeSource), pick };
}
