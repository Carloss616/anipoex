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

export type HistoryActivityFragment = {
  __typename: "ListActivity";
  id: number;
  status: string | null;
  progress: string | null;
  createdAt: number;
  media: {
    __typename: "Media";
    id: number;
    synonyms: Array<string | null> | null;
    genres: Array<string | null> | null;
    status: Types.MediaStatus | null;
    chapters: number | null;
    mediaListEntry: {
      __typename: "MediaList";
      id: number;
      progress: number | null;
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

export type MangaHistoryQueryVariables = Exact<{
  userId: number;
  mediaId?: number | null | undefined;
  page: number;
}>;

export type MangaHistoryQuery = {
  Page: {
    __typename: "Page";
    pageInfo: {
      __typename: "PageInfo";
      currentPage: number | null;
      hasNextPage: boolean | null;
    } | null;
    activities: Array<
      | {
          __typename: "ListActivity";
          id: number;
          status: string | null;
          progress: string | null;
          createdAt: number;
          media: {
            __typename: "Media";
            id: number;
            synonyms: Array<string | null> | null;
            genres: Array<string | null> | null;
            status: Types.MediaStatus | null;
            chapters: number | null;
            mediaListEntry: {
              __typename: "MediaList";
              id: number;
              progress: number | null;
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
        }
      | { __typename: "MessageActivity" }
      | { __typename: "TextActivity" }
      | null
    > | null;
  } | null;
};

export const HistoryActivityFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "HistoryActivity" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ListActivity" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "progress" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "media" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "MangaMedia" },
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
      name: { kind: "Name", value: "MangaBase" },
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
          { kind: "Field", name: { kind: "Name", value: "synonyms" } },
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
            kind: "FragmentSpread",
            name: { kind: "Name", value: "MangaBase" },
          },
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
  ],
} as unknown as DocumentNode<HistoryActivityFragment, unknown>;
export const MangaHistoryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "MangaHistory" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "userId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "mediaId" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
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
            name: { kind: "Name", value: "Page" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "page" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "perPage" },
                value: { kind: "IntValue", value: "50" },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pageInfo" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "currentPage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasNextPage" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "activities" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "userId" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "userId" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "mediaId" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "mediaId" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "type" },
                      value: { kind: "EnumValue", value: "MANGA_LIST" },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "sort" },
                      value: { kind: "EnumValue", value: "ID_DESC" },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "ListActivity" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "FragmentSpread",
                              name: { kind: "Name", value: "HistoryActivity" },
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
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "MangaBase" },
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
          { kind: "Field", name: { kind: "Name", value: "synonyms" } },
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
            kind: "FragmentSpread",
            name: { kind: "Name", value: "MangaBase" },
          },
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
      name: { kind: "Name", value: "HistoryActivity" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ListActivity" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "progress" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "media" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "MangaMedia" },
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
  ],
} as unknown as DocumentNode<MangaHistoryQuery, MangaHistoryQueryVariables>;
