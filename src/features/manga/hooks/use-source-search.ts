import { useInstalledSources } from "@/features/extensions";
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
    (sourceId: string) => {
      const source = sources.find((entry) => entry.id === sourceId);
      if (!manga || !source) return;
      return action(manga.id, source, searchTitles(manga));
    };

  return { select: run(selectSource), resume: run(resumeSource) };
}
