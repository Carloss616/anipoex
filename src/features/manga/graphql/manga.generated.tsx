/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };

import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { fetcher } from "@/graphql/fetcher";
import { TypedDocumentString } from "@/graphql/graphql";
import type * as Types from "@/graphql/types";

/** Media list watching/reading status enum. */
export type MediaListStatus =
  /** Finished watching/reading */
  | "COMPLETED"
  /** Currently watching/reading */
  | "CURRENT"
  /** Stopped watching/reading before completing */
  | "DROPPED"
  /** Paused watching/reading */
  | "PAUSED"
  /** Planning to watch/read */
  | "PLANNING"
  /** Re-watching/reading */
  | "REPEATING";

export type MangaQueryVariables = Exact<{
  id: number;
}>;

export type MangaQuery = {
  Media: {
    id: number;
    genres: Array<string | null> | null;
    chapters: number | null;
    mediaListEntry: {
      id: number;
      status: Types.MediaListStatus | null;
      progress: number | null;
      score: number | null;
      notes: string | null;
      startedAt: {
        year: number | null;
        month: number | null;
        day: number | null;
      } | null;
      completedAt: {
        year: number | null;
        month: number | null;
        day: number | null;
      } | null;
    } | null;
    title: {
      userPreferred: string | null;
      english: string | null;
      romaji: string | null;
      native: string | null;
    } | null;
    coverImage: {
      large: string | null;
      medium: string | null;
      color: string | null;
    } | null;
    startDate: { year: number | null } | null;
  } | null;
};

export const MangaDocument = new TypedDocumentString(`
    query Manga($id: Int!) {
  Media(id: $id, type: MANGA) {
    ...MangaMedia
    mediaListEntry {
      ...MangaListEntry
    }
  }
}
    fragment MangaMedia on Media {
  id
  title {
    userPreferred
    english
    romaji
    native
  }
  coverImage {
    large
    medium
    color
  }
  startDate {
    year
  }
  genres
  chapters
}
fragment MangaListEntry on MediaList {
  id
  status
  progress
  score
  startedAt {
    year
    month
    day
  }
  completedAt {
    year
    month
    day
  }
  notes
}`) as unknown as TypedDocumentString<MangaQuery, MangaQueryVariables>;

export const useMangaQuery = <TData = MangaQuery, TError = unknown>(
  variables: MangaQueryVariables,
  options?: Omit<UseQueryOptions<MangaQuery, TError, TData>, "queryKey"> & {
    queryKey?: UseQueryOptions<MangaQuery, TError, TData>["queryKey"];
  },
) => {
  return useQuery<MangaQuery, TError, TData>({
    queryKey: ["Manga", variables],
    queryFn: fetcher<MangaQuery, MangaQueryVariables>(MangaDocument, variables),
    ...options,
  });
};
