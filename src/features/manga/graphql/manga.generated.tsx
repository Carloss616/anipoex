/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
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

/** The current releasing status of the media */
export type MediaStatus =
  /** Ended before the work could be finished */
  | "CANCELLED"
  /** Has completed and is no longer being released */
  | "FINISHED"
  /** Version 2 only. Is currently paused from releasing and will resume at a later date */
  | "HIATUS"
  /** To be released at a later date */
  | "NOT_YET_RELEASED"
  /** Currently releasing */
  | "RELEASING";

export type MangaQueryVariables = Exact<{
  id: number;
}>;

export type MangaQuery = {
  Media: {
    __typename: "Media";
    id: number;
    description: string | null;
    bannerImage: string | null;
    averageScore: number | null;
    genres: Array<string | null> | null;
    status: Types.MediaStatus | null;
    chapters: number | null;
    startDate: { __typename: "FuzzyDate"; year: number | null } | null;
    mediaListEntry: {
      __typename: "MediaList";
      id: number;
      progress: number | null;
      status: Types.MediaListStatus | null;
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
    staff: {
      __typename: "StaffConnection";
      edges: Array<{
        __typename: "StaffEdge";
        role: string | null;
        node: {
          __typename: "Staff";
          id: number;
          name: { __typename: "StaffName"; full: string | null } | null;
        } | null;
      } | null> | null;
    } | null;
    title: {
      __typename: "MediaTitle";
      userPreferred: string | null;
      english: string | null;
      romaji: string | null;
      native: string | null;
    } | null;
    coverImage: {
      __typename: "MediaCoverImage";
      extraLarge: string | null;
      large: string | null;
      medium: string | null;
      color: string | null;
    } | null;
  } | null;
};

export const MangaDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Manga" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "Media" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "type" },
                value: { kind: "EnumValue", value: "MANGA" },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "MangaDetail" },
                  directives: [
                    {
                      kind: "Directive",
                      name: { kind: "Name", value: "nonreactive" },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    },
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
                { kind: "Field", name: { kind: "Name", value: "extraLarge" } },
                { kind: "Field", name: { kind: "Name", value: "large" } },
                { kind: "Field", name: { kind: "Name", value: "medium" } },
                { kind: "Field", name: { kind: "Name", value: "color" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "genres" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "chapters" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "mediaListEntry" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "progress" } },
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
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "MangaDetail" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Media" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "FragmentSpread",
            name: { kind: "Name", value: "MangaMedia" },
          },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "bannerImage" } },
          { kind: "Field", name: { kind: "Name", value: "averageScore" } },
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
          {
            kind: "Field",
            name: { kind: "Name", value: "staff" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "perPage" },
                value: { kind: "IntValue", value: "6" },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sort" },
                value: { kind: "EnumValue", value: "RELEVANCE" },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "edges" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "node" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "full" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MangaQuery, MangaQueryVariables>;
