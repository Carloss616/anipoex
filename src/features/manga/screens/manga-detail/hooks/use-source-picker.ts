import { useRouter } from "expo-router";
import { useInstalledSources } from "@/features/extensions";
import { useSourceMatch } from "@/features/manga/hooks/use-source-match";
import { openSourcePage } from "@/features/manga/utils/open-source-page";
import { sourceListHref } from "@/features/manga/utils/source-list-href";
import type { SourcePickerManga } from "../components/source-picker";

/** The picked source, and the source list that changes it. */
export function useSourcePicker(manga: SourcePickerManga) {
  const router = useRouter();
  const sources = useInstalledSources();
  const { match } = useSourceMatch(manga.id);
  const source = sources.find((entry) => entry.id === match?.sourceId);

  // Only a matched manga on an installed source has a page to open.
  const webManga = source ? match?.manga : undefined;

  return {
    label: source?.name ?? "Source",
    hasWeb: !!webManga,
    open: () => router.push(sourceListHref(manga.id)),
    /** The manga's page on the source's site. */
    openWeb: async () => {
      if (!webManga || !match) return;
      await openSourcePage(match.sourceId, webManga.url);
    },
  };
}
