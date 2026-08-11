import type { MediaListStatus } from "@/graphql/types";
import type {
  MangaListEntryFragment,
  MangaMediaFragment,
} from "../graphql/manga-fragments.generated";
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
  /** User score from the list entry; `null` when unscored. */
  score: number | null;
  /** `null` when the manga isn't on the user's list. */
  listStatus: MediaListStatus | null;
};

/**
 * Both the list and the detail query select the same two fragments, so a single
 * mapper covers the cached-list path and the fetched-by-id path.
 */
export function toEntry(
  media: MangaMediaFragment | null | undefined,
  entry: MangaListEntryFragment | null | undefined,
): MangaEntry | null {
  if (!media) return null;

  return {
    id: String(media.id),
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
    genres: media.genres?.filter((g) => g !== null) ?? [],
    cover: media.coverImage?.large ?? null,
    coverThumb: media.coverImage?.medium ?? null,
    coverColor: media.coverImage?.color ?? null,
    progress: entry?.progress ?? 0,
    chapters: media.chapters ?? null,
    score: entry?.score ?? null,
    listStatus: entry?.status ?? null,
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
          const mapped = toEntry(entry?.media, entry);
          return mapped ? [mapped] : [];
        }) ?? [],
    ) ?? []
  );
}
