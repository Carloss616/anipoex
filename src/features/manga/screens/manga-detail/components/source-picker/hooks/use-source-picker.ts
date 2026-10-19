import { useState } from "react";
import { toast } from "@/components/ui/toast";
import { runtime, useInstalledSources } from "@/features/extensions";
import { useSourceMatch } from "@/features/manga/hooks/use-source-match";
import { useSourceSearch } from "@/features/manga/hooks/use-source-search";
import { openExternal } from "@/utils/open-external";
import type { SourcePickerManga } from "../source-picker";

/** The picked source, its match and the sheet that changes it. */
export function useSourcePicker(manga: SourcePickerManga) {
  const [isPresented, setIsPresented] = useState(false);
  const sources = useInstalledSources();
  const { match, matching } = useSourceMatch(manga.id);
  const search = useSourceSearch(manga);
  const source = sources.find((entry) => entry.id === match?.sourceId);

  // Only a matched manga on an installed source has a page to open.
  const webManga = source ? match?.manga : undefined;

  return {
    label: source?.name ?? "Source",
    sourceId: match?.sourceId,
    match,
    hasWeb: !!webManga,
    matching,
    isPresented,
    open: () => setIsPresented(true),
    close: () => setIsPresented(false),
    /** The manga's page on the source's site. */
    openWeb: async () => {
      if (!webManga || !match) return;
      const url = await runtime
        .mangaWebUrl(match.sourceId, webManga.url)
        .catch(() => null);
      if (!url || !openExternal(url))
        toast.destructive("Couldn't open this manga's page");
    },
    // The sheet closes on pick; the button already shows it while the search runs.
    select: (nextId: string) => {
      setIsPresented(false);
      search.select(nextId);
    },
  };
}
