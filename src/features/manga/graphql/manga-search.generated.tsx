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
/** The format the media was released in */
export type MediaFormat =
  /** Professionally published manga with more than one chapter */
  | "MANGA"
  /** Anime movies with a theatrical release */
  | "MOVIE"
  /** Short anime released as a music video */
  | "MUSIC"
  /** Written books released as a series of light novels */
  | "NOVEL"
  /** (Original Net Animation) Anime that have been originally released online or are only available through streaming services. */
  | "ONA"
  /** Manga with just one chapter */
  | "ONE_SHOT"
  /** (Original Video Animation) Anime that have been released directly on DVD/Blu-ray without originally going through a theatrical release or television broadcast */
  | "OVA"
  /** Special episodes that have been included in DVD/Blu-ray releases, picture dramas, pilots, etc */
  | "SPECIAL"
  /** Anime broadcast on television */
  | "TV"
  /** Anime which are under 15 minutes in length and broadcast on television */
  | "TV_SHORT";

/** Media sort enums */
export type MediaSort =
  | "CHAPTERS"
  | "CHAPTERS_DESC"
  | "DURATION"
  | "DURATION_DESC"
  | "END_DATE"
  | "END_DATE_DESC"
  | "EPISODES"
  | "EPISODES_DESC"
  | "FAVOURITES"
  | "FAVOURITES_DESC"
  | "FORMAT"
  | "FORMAT_DESC"
  | "ID"
  | "ID_DESC"
  | "POPULARITY"
  | "POPULARITY_DESC"
  | "SCORE"
  | "SCORE_DESC"
  | "SEARCH_MATCH"
  | "START_DATE"
  | "START_DATE_DESC"
  | "STATUS"
  | "STATUS_DESC"
  | "TITLE_ENGLISH"
  | "TITLE_ENGLISH_DESC"
  | "TITLE_NATIVE"
  | "TITLE_NATIVE_DESC"
  | "TITLE_ROMAJI"
  | "TITLE_ROMAJI_DESC"
  | "TRENDING"
  | "TRENDING_DESC"
  | "TYPE"
  | "TYPE_DESC"
  | "UPDATED_AT"
  | "UPDATED_AT_DESC"
  | "VOLUMES"
  | "VOLUMES_DESC";

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

export type MangaSearchQueryVariables = Exact<{
  page: number;
  search?: string | null | undefined;
  genre?: string | null | undefined;
  format?: Types.MediaFormat | null | undefined;
  country?: unknown;
  status?: Types.MediaStatus | null | undefined;
  sort?:
    | Array<Types.MediaSort | null | undefined>
    | Types.MediaSort
    | null
    | undefined;
  startDateGreater?: unknown;
}>;

export type MangaSearchQuery = {
  Page: {
    __typename: "Page";
    pageInfo: { __typename: "PageInfo"; hasNextPage: boolean | null } | null;
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
};

export const MangaSearchDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "MangaSearch" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "search" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "genre" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "format" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "MediaFormat" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "country" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "CountryCode" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "status" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "MediaStatus" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "sort" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "MediaSort" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "startDateGreater" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "FuzzyDateInt" },
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
                value: { kind: "IntValue", value: "30" },
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
                        name: { kind: "Name", value: "hasNextPage" },
                      },
                    ],
                  },
                },
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
                      name: { kind: "Name", value: "search" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "search" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "genre" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "genre" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "format" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "format" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "countryOfOrigin" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "country" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "status" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "status" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "sort" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "sort" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "startDate_greater" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "startDateGreater" },
                      },
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
} as unknown as DocumentNode<MangaSearchQuery, MangaSearchQueryVariables>;
