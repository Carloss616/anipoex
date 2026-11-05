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

export type HomeActivityFragment = {
  __typename: "ListActivity";
  id: number;
  status: string | null;
  progress: string | null;
  createdAt: number;
  user: {
    __typename: "User";
    id: number;
    name: string;
    avatar: { __typename: "UserAvatar"; medium: string | null } | null;
  } | null;
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

export type HomeSectionsQueryVariables = Exact<{
  userId: number;
  year: unknown;
  trending: boolean;
  because: boolean;
  genres: boolean;
  following: boolean;
  releasing: boolean;
  new: boolean;
  top: boolean;
  manhwa: boolean;
  planning: boolean;
  global: boolean;
}>;

export type HomeSectionsQuery = {
  genres?: Array<string | null> | null;
  trending?: {
    __typename: "Page";
    media: Array<{
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
    } | null> | null;
  } | null;
  releasing?: {
    __typename: "Page";
    media: Array<{
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
    } | null> | null;
  } | null;
  new?: {
    __typename: "Page";
    media: Array<{
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
    } | null> | null;
  } | null;
  top?: {
    __typename: "Page";
    media: Array<{
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
    } | null> | null;
  } | null;
  manhwa?: {
    __typename: "Page";
    media: Array<{
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
    } | null> | null;
  } | null;
  planning?: {
    __typename: "Page";
    mediaList: Array<{
      __typename: "MediaList";
      id: number;
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
    } | null> | null;
  } | null;
  because?: {
    __typename: "Page";
    mediaList: Array<{
      __typename: "MediaList";
      id: number;
      media: {
        __typename: "Media";
        id: number;
        title: {
          __typename: "MediaTitle";
          userPreferred: string | null;
        } | null;
        recommendations: {
          __typename: "RecommendationConnection";
          nodes: Array<{
            __typename: "Recommendation";
            id: number;
            mediaRecommendation: {
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
          } | null> | null;
        } | null;
      } | null;
    } | null> | null;
  } | null;
  following?: {
    __typename: "Page";
    activities: Array<
      | {
          __typename: "ListActivity";
          id: number;
          status: string | null;
          progress: string | null;
          createdAt: number;
          user: {
            __typename: "User";
            id: number;
            name: string;
            avatar: { __typename: "UserAvatar"; medium: string | null } | null;
          } | null;
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
  global?: {
    __typename: "Page";
    activities: Array<
      | {
          __typename: "ListActivity";
          id: number;
          status: string | null;
          progress: string | null;
          createdAt: number;
          user: {
            __typename: "User";
            id: number;
            name: string;
            avatar: { __typename: "UserAvatar"; medium: string | null } | null;
          } | null;
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

export const HomeActivityFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "HomeActivity" },
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
            name: { kind: "Name", value: "user" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "avatar" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "medium" },
                      },
                    ],
                  },
                },
              ],
            },
          },
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
} as unknown as DocumentNode<HomeActivityFragment, unknown>;
export const HomeSectionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "HomeSections" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "year" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "FuzzyDateInt" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "trending" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Boolean" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "because" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Boolean" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "genres" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Boolean" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "following" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Boolean" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "releasing" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Boolean" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "new" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Boolean" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "top" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Boolean" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "manhwa" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Boolean" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "planning" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Boolean" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "global" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Boolean" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            alias: { kind: "Name", value: "trending" },
            name: { kind: "Name", value: "Page" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "perPage" },
                value: { kind: "IntValue", value: "10" },
              },
            ],
            directives: [
              {
                kind: "Directive",
                name: { kind: "Name", value: "include" },
                arguments: [
                  {
                    kind: "Argument",
                    name: { kind: "Name", value: "if" },
                    value: {
                      kind: "Variable",
                      name: { kind: "Name", value: "trending" },
                    },
                  },
                ],
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "media" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "type" },
                      value: { kind: "EnumValue", value: "MANGA" },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "isAdult" },
                      value: { kind: "BooleanValue", value: false },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "sort" },
                      value: { kind: "EnumValue", value: "TRENDING_DESC" },
                    },
                  ],
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
            kind: "Field",
            alias: { kind: "Name", value: "releasing" },
            name: { kind: "Name", value: "Page" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "perPage" },
                value: { kind: "IntValue", value: "10" },
              },
            ],
            directives: [
              {
                kind: "Directive",
                name: { kind: "Name", value: "include" },
                arguments: [
                  {
                    kind: "Argument",
                    name: { kind: "Name", value: "if" },
                    value: {
                      kind: "Variable",
                      name: { kind: "Name", value: "releasing" },
                    },
                  },
                ],
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "media" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "type" },
                      value: { kind: "EnumValue", value: "MANGA" },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "isAdult" },
                      value: { kind: "BooleanValue", value: false },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "status" },
                      value: { kind: "EnumValue", value: "RELEASING" },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "sort" },
                      value: { kind: "EnumValue", value: "POPULARITY_DESC" },
                    },
                  ],
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
            kind: "Field",
            alias: { kind: "Name", value: "new" },
            name: { kind: "Name", value: "Page" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "perPage" },
                value: { kind: "IntValue", value: "10" },
              },
            ],
            directives: [
              {
                kind: "Directive",
                name: { kind: "Name", value: "include" },
                arguments: [
                  {
                    kind: "Argument",
                    name: { kind: "Name", value: "if" },
                    value: {
                      kind: "Variable",
                      name: { kind: "Name", value: "new" },
                    },
                  },
                ],
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "media" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "type" },
                      value: { kind: "EnumValue", value: "MANGA" },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "isAdult" },
                      value: { kind: "BooleanValue", value: false },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "startDate_greater" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "year" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "sort" },
                      value: { kind: "EnumValue", value: "POPULARITY_DESC" },
                    },
                  ],
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
            kind: "Field",
            alias: { kind: "Name", value: "top" },
            name: { kind: "Name", value: "Page" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "perPage" },
                value: { kind: "IntValue", value: "10" },
              },
            ],
            directives: [
              {
                kind: "Directive",
                name: { kind: "Name", value: "include" },
                arguments: [
                  {
                    kind: "Argument",
                    name: { kind: "Name", value: "if" },
                    value: {
                      kind: "Variable",
                      name: { kind: "Name", value: "top" },
                    },
                  },
                ],
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "media" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "type" },
                      value: { kind: "EnumValue", value: "MANGA" },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "isAdult" },
                      value: { kind: "BooleanValue", value: false },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "sort" },
                      value: { kind: "EnumValue", value: "SCORE_DESC" },
                    },
                  ],
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
            kind: "Field",
            alias: { kind: "Name", value: "manhwa" },
            name: { kind: "Name", value: "Page" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "perPage" },
                value: { kind: "IntValue", value: "10" },
              },
            ],
            directives: [
              {
                kind: "Directive",
                name: { kind: "Name", value: "include" },
                arguments: [
                  {
                    kind: "Argument",
                    name: { kind: "Name", value: "if" },
                    value: {
                      kind: "Variable",
                      name: { kind: "Name", value: "manhwa" },
                    },
                  },
                ],
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "media" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "type" },
                      value: { kind: "EnumValue", value: "MANGA" },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "isAdult" },
                      value: { kind: "BooleanValue", value: false },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "countryOfOrigin" },
                      value: { kind: "StringValue", value: "KR", block: false },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "sort" },
                      value: { kind: "EnumValue", value: "POPULARITY_DESC" },
                    },
                  ],
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
            kind: "Field",
            alias: { kind: "Name", value: "planning" },
            name: { kind: "Name", value: "Page" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "perPage" },
                value: { kind: "IntValue", value: "10" },
              },
            ],
            directives: [
              {
                kind: "Directive",
                name: { kind: "Name", value: "include" },
                arguments: [
                  {
                    kind: "Argument",
                    name: { kind: "Name", value: "if" },
                    value: {
                      kind: "Variable",
                      name: { kind: "Name", value: "planning" },
                    },
                  },
                ],
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "mediaList" },
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
                      name: { kind: "Name", value: "type" },
                      value: { kind: "EnumValue", value: "MANGA" },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "status" },
                      value: { kind: "EnumValue", value: "PLANNING" },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "sort" },
                      value: { kind: "EnumValue", value: "UPDATED_TIME_DESC" },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "media" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
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
            },
          },
          {
            kind: "Field",
            alias: { kind: "Name", value: "because" },
            name: { kind: "Name", value: "Page" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "perPage" },
                value: { kind: "IntValue", value: "1" },
              },
            ],
            directives: [
              {
                kind: "Directive",
                name: { kind: "Name", value: "include" },
                arguments: [
                  {
                    kind: "Argument",
                    name: { kind: "Name", value: "if" },
                    value: {
                      kind: "Variable",
                      name: { kind: "Name", value: "because" },
                    },
                  },
                ],
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "mediaList" },
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
                      name: { kind: "Name", value: "type" },
                      value: { kind: "EnumValue", value: "MANGA" },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "status" },
                      value: { kind: "EnumValue", value: "COMPLETED" },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "sort" },
                      value: { kind: "EnumValue", value: "UPDATED_TIME_DESC" },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "media" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "title" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "userPreferred",
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "recommendations" },
                              arguments: [
                                {
                                  kind: "Argument",
                                  name: { kind: "Name", value: "sort" },
                                  value: {
                                    kind: "EnumValue",
                                    value: "RATING_DESC",
                                  },
                                },
                                {
                                  kind: "Argument",
                                  name: { kind: "Name", value: "perPage" },
                                  value: { kind: "IntValue", value: "10" },
                                },
                              ],
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "nodes" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "id" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "mediaRecommendation",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "id",
                                                },
                                              },
                                              {
                                                kind: "FragmentSpread",
                                                name: {
                                                  kind: "Name",
                                                  value: "MangaMedia",
                                                },
                                                directives: [
                                                  {
                                                    kind: "Directive",
                                                    name: {
                                                      kind: "Name",
                                                      value: "nonreactive",
                                                    },
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
            kind: "Field",
            alias: { kind: "Name", value: "following" },
            name: { kind: "Name", value: "Page" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "perPage" },
                value: { kind: "IntValue", value: "8" },
              },
            ],
            directives: [
              {
                kind: "Directive",
                name: { kind: "Name", value: "include" },
                arguments: [
                  {
                    kind: "Argument",
                    name: { kind: "Name", value: "if" },
                    value: {
                      kind: "Variable",
                      name: { kind: "Name", value: "following" },
                    },
                  },
                ],
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "activities" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "isFollowing" },
                      value: { kind: "BooleanValue", value: true },
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
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "HomeActivity" },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            alias: { kind: "Name", value: "global" },
            name: { kind: "Name", value: "Page" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "perPage" },
                value: { kind: "IntValue", value: "8" },
              },
            ],
            directives: [
              {
                kind: "Directive",
                name: { kind: "Name", value: "include" },
                arguments: [
                  {
                    kind: "Argument",
                    name: { kind: "Name", value: "if" },
                    value: {
                      kind: "Variable",
                      name: { kind: "Name", value: "global" },
                    },
                  },
                ],
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "activities" },
                  arguments: [
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
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "HomeActivity" },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            alias: { kind: "Name", value: "genres" },
            name: { kind: "Name", value: "GenreCollection" },
            directives: [
              {
                kind: "Directive",
                name: { kind: "Name", value: "include" },
                arguments: [
                  {
                    kind: "Argument",
                    name: { kind: "Name", value: "if" },
                    value: {
                      kind: "Variable",
                      name: { kind: "Name", value: "genres" },
                    },
                  },
                ],
              },
            ],
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
      name: { kind: "Name", value: "HomeActivity" },
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
            name: { kind: "Name", value: "user" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "avatar" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "medium" },
                      },
                    ],
                  },
                },
              ],
            },
          },
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
} as unknown as DocumentNode<HomeSectionsQuery, HomeSectionsQueryVariables>;
