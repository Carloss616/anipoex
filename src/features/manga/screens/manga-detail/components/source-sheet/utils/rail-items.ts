import type { SourceManga } from "@/features/extensions";

/** One card of a source's rail: a result, or the source's current match. */
export interface RailItem {
  manga: SourceManga;
  current: boolean;
}

/** The current match first, its cover taken from its result when it has none; then the other results. */
export function railItems(
  current:
    | { url: string; title: string; thumbnailUrl?: string | null }
    | undefined,
  mangas: SourceManga[],
): RailItem[] {
  const rest = mangas.filter((manga) => manga.url !== current?.url);
  if (!current) return rest.map((manga) => ({ manga, current: false }));
  const thumbnailUrl =
    current.thumbnailUrl ??
    mangas.find((manga) => manga.url === current.url)?.thumbnailUrl ??
    null;
  return [
    {
      manga: { url: current.url, title: current.title, thumbnailUrl },
      current: true,
    },
    ...rest.map((manga) => ({ manga, current: false })),
  ];
}
