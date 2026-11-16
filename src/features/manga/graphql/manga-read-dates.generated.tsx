/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type MangaReadDatesQueryVariables = Exact<{
  userId: number;
  mediaId: number;
}>;

export type MangaReadDatesQuery = {
  latest: {
    __typename: "Page";
    activities: Array<
      | {
          __typename: "ListActivity";
          id: number;
          createdAt: number;
          status: string | null;
          progress: string | null;
        }
      | { __typename: "MessageActivity" }
      | { __typename: "TextActivity" }
      | null
    > | null;
  } | null;
  earliest: {
    __typename: "Page";
    activities: Array<
      | {
          __typename: "ListActivity";
          id: number;
          createdAt: number;
          status: string | null;
          progress: string | null;
        }
      | { __typename: "MessageActivity" }
      | { __typename: "TextActivity" }
      | null
    > | null;
  } | null;
};

export const MangaReadDatesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "MangaReadDates" },
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
            alias: { kind: "Name", value: "latest" },
            name: { kind: "Name", value: "Page" },
            arguments: [
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
                              kind: "Field",
                              name: { kind: "Name", value: "createdAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "status" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "progress" },
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
            alias: { kind: "Name", value: "earliest" },
            name: { kind: "Name", value: "Page" },
            arguments: [
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
                      value: { kind: "EnumValue", value: "ID" },
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
                              kind: "Field",
                              name: { kind: "Name", value: "createdAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "status" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "progress" },
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
} as unknown as DocumentNode<MangaReadDatesQuery, MangaReadDatesQueryVariables>;
