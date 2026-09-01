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
/** Media list scoring type */
export type ScoreFormat =
  /** An integer from 0-3. Should be represented in Smileys. 0 => No Score, 1 => :(, 2 => :|, 3 => :) */
  | "POINT_3"
  /** An integer from 0-5. Should be represented in Stars */
  | "POINT_5"
  /** An integer from 0-10 */
  | "POINT_10"
  /** A float from 0-10 with 1 decimal place */
  | "POINT_10_DECIMAL"
  /** An integer from 0-100 */
  | "POINT_100";

export type ViewerQueryVariables = Exact<{ [key: string]: never }>;

export type ViewerQuery = {
  Viewer: {
    __typename: "User";
    id: number;
    name: string;
    avatar: { __typename: "UserAvatar"; large: string | null } | null;
    mediaListOptions: {
      __typename: "MediaListOptions";
      scoreFormat: Types.ScoreFormat | null;
    } | null;
  } | null;
};

export const ViewerDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Viewer" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "Viewer" },
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
                      { kind: "Field", name: { kind: "Name", value: "large" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "mediaListOptions" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "scoreFormat" },
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
} as unknown as DocumentNode<ViewerQuery, ViewerQueryVariables>;
