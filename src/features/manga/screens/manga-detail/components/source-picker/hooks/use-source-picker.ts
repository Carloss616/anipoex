import { useState } from "react";
import { toast } from "@/components/ui/toast";
import { runtime, useInstalledSources } from "@/features/extensions";
import { useSourceMatch } from "@/features/manga/hooks/use-source-match";
import { selectSource } from "@/features/manga/state/source";
import { openExternal } from "@/utils/open-external";
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
    /** The manga's page on the source's site; only a matched manga has one. */
    openWeb: async () => {
      if (!match?.manga) return;
      const url = await runtime
        .mangaWebUrl(match.sourceId, match.manga.url)
        .catch(() => null);
      if (!url || !openExternal(url))
        toast.destructive("Couldn't open this manga's page");
    },
    // The sheet closes on pick so the detail's loading state answers the tap while the search runs.
    select: (nextId: string) => {
      const next = sources.find((entry) => entry.id === nextId);
      if (!next) return;
      setIsPresented(false);
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
