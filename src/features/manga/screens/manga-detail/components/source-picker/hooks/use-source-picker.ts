import { useState } from "react";
import { useInstalledSources } from "@/features/extensions";
import { useSourceMatch } from "@/features/manga/hooks/use-source-match";
import { selectSource } from "@/features/manga/state/source";
import type { SourcePickerManga } from "../source-picker";

/** The picked source, its match and the sheet that changes it. */
export function useSourcePicker(manga: SourcePickerManga) {
  const [isPresented, setIsPresented] = useState(false);
  const sources = useInstalledSources();
  const { match, matching } = useSourceMatch(manga.id);
  const source = sources.find((entry) => entry.id === match?.sourceId);

  return {
    label: source?.name ?? "Source",
    sourceId: match?.sourceId,
    match,
    matching,
    isPresented,
    open: () => setIsPresented(true),
    close: () => setIsPresented(false),
    // The sheet stays open: the check moves once the search answers, and the header shows the new source.
    select: (nextId: string) => {
      const next = sources.find((entry) => entry.id === nextId);
      if (!next) return;
      const { title, synonyms = [] } = manga;
      selectSource(manga.id, next, {
        search: [title?.romaji, title?.english],
        all: [
          title?.romaji,
          title?.english,
          title?.userPreferred,
          title?.native,
          ...(synonyms ?? []),
        ],
      });
    },
  };
}
