/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };

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

export type MangaMediaFragment = {
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
};

export type MangaListEntryFragment = {
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
};

export const MangaMediaFragmentDoc = new TypedDocumentString(
  `
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
    `,
  { fragmentName: "MangaMedia" },
) as unknown as TypedDocumentString<MangaMediaFragment, unknown>;
export const MangaListEntryFragmentDoc = new TypedDocumentString(
  `
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
    `,
  { fragmentName: "MangaListEntry" },
) as unknown as TypedDocumentString<MangaListEntryFragment, unknown>;
