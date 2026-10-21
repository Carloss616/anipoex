import type { Observable } from "@legendapp/state";
import { useInstalledSources } from "@/features/extensions";
import { useSourceMatch } from "@/features/manga/hooks/use-source-match";
import { useSourceSearch } from "@/features/manga/hooks/use-source-search";
import { useTrackingEntry } from "@/features/manga/hooks/use-tracking-entry";
import { openSourcePage } from "@/features/manga/utils/open-source-page";
import type { SourcePickerManga } from "../components/source-picker";

/** The picked source, its match and the sheet that changes it, open while `open$` is true. */
export function useSourcePicker(
  manga: SourcePickerManga,
  entryId: number | null | undefined,
  open$: Observable<boolean>,
) {
  const sources = useInstalledSources();
  const { match, matching } = useSourceMatch(manga.id);
  const search = useSourceSearch(manga);
  const read = useTrackingEntry(entryId)?.progress ?? 0;
  const source = sources.find((entry) => entry.id === match?.sourceId);

  // Only a matched manga on an installed source has a page to open.
  const webManga = source ? match?.manga : undefined;

  return {
    read,
    label: source?.name ?? "Source",
    sourceId: match?.sourceId,
    match,
    hasWeb: !!webManga,
    matching,
    open: () => open$.set(true),
    close: () => open$.set(false),
    /** The manga's page on the source's site. */
    openWeb: async () => {
      if (!webManga || !match) return;
      await openSourcePage(match.sourceId, webManga.url);
    },
    // The sheet closes on pick; the button already shows it while the search runs. Re-picking a found match only closes it; no match or pending retries.
    select: (nextId: string) => {
      open$.set(false);
      if (nextId === match?.sourceId && match.manga) return;
      search.select(nextId);
    },
  };
}
