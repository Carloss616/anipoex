import type { DeepPartial } from "@apollo/client/utilities";
import type { MangaMediaFragment } from "../graphql/manga-fragments.generated";
import type { MangaListQuery } from "../graphql/manga-list.generated";

export type MangaEntry = {
  id: string;
  title: string;
  /** Every title AniList knows, deduped — what search matches against. */
  titles: string[];
  year: string;
  genres: string[];
  cover: string | null;
  coverThumb: string | null;
  coverColor: string | null;
  progress: number;
  chapters: number | null;
};

export function toEntry(
  id: number,
  media: DeepPartial<MangaMediaFragment> | null | undefined,
): MangaEntry | null {
  if (!media || Object.keys(media).length === 0) return null;

  return {
    id: String(id),
    title: media.title?.userPreferred ?? "",
    titles: [
      ...new Set(
        [
          media.title?.userPreferred,
          media.title?.english,
          media.title?.romaji,
          media.title?.native,
        ].filter((t): t is string => !!t),
      ),
    ],
    year: media.startDate?.year ? String(media.startDate.year) : "",
    genres: media.genres?.filter((g): g is string => !!g) ?? [],
    cover: media.coverImage?.large ?? null,
    coverThumb: media.coverImage?.medium ?? null,
    coverColor: media.coverImage?.color ?? null,
    progress: media.mediaListEntry?.progress ?? 0,
    chapters: media.chapters ?? null,
  };
}

/**
 * Every level of the response is nullable, and an entry whose media is missing
 * has nothing to render — flatMap drops it instead of leaking a hole.
 */
export function toEntries(data: MangaListQuery | undefined): MangaEntry[] {
  return (
    data?.MediaListCollection?.lists?.flatMap(
      (list) =>
        list?.entries?.flatMap((entry) => {
          const mapped = entry?.media
            ? toEntry(entry.media.id, entry.media)
            : null;
          return mapped ? [mapped] : [];
        }) ?? [],
    ) ?? []
  );
}
