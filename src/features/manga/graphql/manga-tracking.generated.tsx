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
/** Date object that allows for incomplete date values (fuzzy) */
export type FuzzyDateInput = {
  /** Numeric Day (24) */
  day?: number | null | undefined;
  /** Numeric Month (3) */
  month?: number | null | undefined;
  /** Numeric Year (2017) */
  year?: number | null | undefined;
};

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

export type SaveMangaEntryMutationVariables = Exact<{
  id?: number | null | undefined;
  mediaId?: number | null | undefined;
  status?: Types.MediaListStatus | null | undefined;
  progress?: number | null | undefined;
  score?: number | null | undefined;
  startedAt?: Types.FuzzyDateInput | null | undefined;
  completedAt?: Types.FuzzyDateInput | null | undefined;
}>;

export type SaveMangaEntryMutation = {
  SaveMediaListEntry: {
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

export type DeleteMangaEntryMutationVariables = Exact<{
  id: number;
}>;

export type DeleteMangaEntryMutation = {
  DeleteMediaListEntry: {
    __typename: "Deleted";
    deleted: boolean | null;
  } | null;
};

export const SaveMangaEntryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SaveMangaEntry" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
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
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "status" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "MediaListStatus" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "progress" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "score" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Float" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "startedAt" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "FuzzyDateInput" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "completedAt" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "FuzzyDateInput" },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "SaveMediaListEntry" },
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
                name: { kind: "Name", value: "mediaId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "mediaId" },
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
                name: { kind: "Name", value: "progress" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "progress" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "score" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "score" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "startedAt" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "startedAt" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "completedAt" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "completedAt" },
                },
              },
            ],
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
} as unknown as DocumentNode<
  SaveMangaEntryMutation,
  SaveMangaEntryMutationVariables
>;
export const DeleteMangaEntryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteMangaEntry" },
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
            name: { kind: "Name", value: "DeleteMediaListEntry" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "deleted" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteMangaEntryMutation,
  DeleteMangaEntryMutationVariables
>;
