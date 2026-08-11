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

export type MangaListQueryVariables = Exact<{
  userId: number;
  status: Types.MediaListStatus;
}>;

export type MangaListQuery = {
  MediaListCollection: {
    lists: Array<{
      entries: Array<{
        id: number;
        status: Types.MediaListStatus | null;
        progress: number | null;
        score: number | null;
        notes: string | null;
        media: {
          id: number;
          genres: Array<string | null> | null;
          chapters: number | null;
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
      } | null> | null;
    } | null> | null;
  } | null;
};

export const MangaListDocument = new TypedDocumentString(`
    query MangaList($userId: Int!, $status: MediaListStatus!) {
  MediaListCollection(
    userId: $userId
    type: MANGA
    status: $status
    forceSingleCompletedList: true
  ) {
    lists {
      entries {
        ...MangaListEntry
        media {
          ...MangaMedia
        }
      }
    }
  }
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
}`) as unknown as TypedDocumentString<MangaListQuery, MangaListQueryVariables>;

export const useMangaListQuery = <TData = MangaListQuery, TError = unknown>(
  variables: MangaListQueryVariables,
  options?: Omit<UseQueryOptions<MangaListQuery, TError, TData>, "queryKey"> & {
    queryKey?: UseQueryOptions<MangaListQuery, TError, TData>["queryKey"];
  },
) => {
  return useQuery<MangaListQuery, TError, TData>({
    queryKey: ["MangaList", variables],
    queryFn: fetcher<MangaListQuery, MangaListQueryVariables>(
      MangaListDocument,
      variables,
    ),
    ...options,
  });
};
