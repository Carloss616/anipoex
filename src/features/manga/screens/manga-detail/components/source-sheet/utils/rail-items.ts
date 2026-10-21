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

/** What the rail says beside its cards: a failed or empty first page, judged by the results, not the current card. */
export function railNotice(rail: {
  status: "loading" | "done" | "error";
  mangas: SourceManga[];
}): "error" | "empty" | null {
  if (rail.mangas.length > 0 || rail.status === "loading") return null;
  return rail.status === "error" ? "error" : "empty";
}
