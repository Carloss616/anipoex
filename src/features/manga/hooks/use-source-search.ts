import { useInstalledSources } from "@/features/extensions";
import { recordProbe } from "../state/probes";
import { resumeSource, selectSource } from "../state/source";
import { searchTitles } from "../utils/source-match";
import type { MangaDetail } from "../utils/to-detail";

/** Searches an installed source for the manga: `select` stores a new pick, `resume` finishes one that has no manga yet. */
export function useSourceSearch(
  manga: Pick<MangaDetail, "id" | "title" | "synonyms"> | undefined,
) {
  const sources = useInstalledSources();

  const run =
    (action: typeof selectSource | typeof resumeSource) =>
    async (sourceId: string) => {
      const source = sources.find((entry) => entry.id === sourceId);
      if (!manga || !source) return;
      const found = await action(manga.id, source, searchTitles(manga));
      // A search that finds nothing or fails loads no chapters, so its probe is recorded here.
      if (found === null) recordProbe(manga.id, source, "no-match");
      else if (found === "error") recordProbe(manga.id, source, "error");
    };

  return { select: run(selectSource), resume: run(resumeSource) };
}
