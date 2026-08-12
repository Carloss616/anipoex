/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
import type * as Types from "@/graphql/types.generated";
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

export type MangaListEntryFragment = {
  __typename: "MediaList";
  status: Types.MediaListStatus | null;
  progress: number | null;
  score: number | null;
  notes: string | null;
  startedAt: {
    __typename: "FuzzyDate";
    year: number | null;
    month: number | null;
    day: number | null;
  } | null;
  completedAt: {
    __typename: "FuzzyDate";
    year: number | null;
    month: number | null;
    day: number | null;
  } | null;
};

export type MangaMediaFragment = {
  __typename: "Media";
  genres: Array<string | null> | null;
  chapters: number | null;
  title: {
    __typename: "MediaTitle";
    userPreferred: string | null;
    english: string | null;
    romaji: string | null;
    native: string | null;
  } | null;
  coverImage: {
    __typename: "MediaCoverImage";
    large: string | null;
    medium: string | null;
    color: string | null;
  } | null;
  startDate: { __typename: "FuzzyDate"; year: number | null } | null;
  mediaListEntry: {
    __typename: "MediaList";
    id: number;
    status: Types.MediaListStatus | null;
    progress: number | null;
    score: number | null;
    notes: string | null;
    startedAt: {
      __typename: "FuzzyDate";
      year: number | null;
      month: number | null;
      day: number | null;
    } | null;
    completedAt: {
      __typename: "FuzzyDate";
      year: number | null;
      month: number | null;
      day: number | null;
    } | null;
  } | null;
};

export const MangaListEntryFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "MangaListEntry" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "MediaList" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "progress" } },
          { kind: "Field", name: { kind: "Name", value: "score" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "startedAt" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "year" } },
                { kind: "Field", name: { kind: "Name", value: "month" } },
                { kind: "Field", name: { kind: "Name", value: "day" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "completedAt" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "year" } },
                { kind: "Field", name: { kind: "Name", value: "month" } },
                { kind: "Field", name: { kind: "Name", value: "day" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "notes" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MangaListEntryFragment, unknown>;
export const MangaMediaFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "MangaMedia" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Media" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "title" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "userPreferred" },
                },
                { kind: "Field", name: { kind: "Name", value: "english" } },
                { kind: "Field", name: { kind: "Name", value: "romaji" } },
                { kind: "Field", name: { kind: "Name", value: "native" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "coverImage" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "large" } },
                { kind: "Field", name: { kind: "Name", value: "medium" } },
                { kind: "Field", name: { kind: "Name", value: "color" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "startDate" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "year" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "genres" } },
          { kind: "Field", name: { kind: "Name", value: "chapters" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "mediaListEntry" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "MangaListEntry" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "MangaListEntry" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "MediaList" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "progress" } },
          { kind: "Field", name: { kind: "Name", value: "score" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "startedAt" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "year" } },
                { kind: "Field", name: { kind: "Name", value: "month" } },
                { kind: "Field", name: { kind: "Name", value: "day" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "completedAt" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "year" } },
                { kind: "Field", name: { kind: "Name", value: "month" } },
                { kind: "Field", name: { kind: "Name", value: "day" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "notes" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MangaMediaFragment, unknown>;
