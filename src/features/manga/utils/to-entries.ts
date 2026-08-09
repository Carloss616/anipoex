import type { MangaListQuery } from "../graphql/manga-list.generated";

export type MangaEntry = {
  id: string;
  title: string;
  year: string;
  genres: string[];
  cover: string | null;
  progress: number;
  chapters: number | null;
};

/**
 * Every level of the response is nullable, and an entry whose media is missing
 * has nothing to render — flatMap drops it instead of leaking a hole.
 */
export function toEntries(data: MangaListQuery | undefined): MangaEntry[] {
  return (
    data?.MediaListCollection?.lists?.flatMap(
      (list) =>
        list?.entries?.flatMap((entry) =>
          entry?.media
            ? [
                {
                  id: String(entry.media.id),
                  title: entry.media.title?.userPreferred ?? "",
                  year: entry.media.startDate?.year
                    ? String(entry.media.startDate.year)
                    : "",
                  genres: entry.media.genres?.filter((g) => g !== null) ?? [],
                  cover: entry.media.coverImage?.large ?? null,
                  progress: entry.progress ?? 0,
                  chapters: entry.media.chapters ?? null,
                },
              ]
            : [],
        ) ?? [],
    ) ?? []
  );
}
