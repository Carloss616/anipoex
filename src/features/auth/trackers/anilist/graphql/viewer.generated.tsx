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

export type ViewerQueryVariables = Exact<{ [key: string]: never }>;

export type ViewerQuery = {
  Viewer: {
    id: number;
    name: string;
    avatar: { large: string | null } | null;
  } | null;
};

export const ViewerDocument = new TypedDocumentString(`
    query Viewer {
  Viewer {
    id
    name
    avatar {
      large
    }
  }
}
    `) as unknown as TypedDocumentString<ViewerQuery, ViewerQueryVariables>;

export const useViewerQuery = <TData = ViewerQuery, TError = unknown>(
  variables?: ViewerQueryVariables,
  options?: Omit<UseQueryOptions<ViewerQuery, TError, TData>, "queryKey"> & {
    queryKey?: UseQueryOptions<ViewerQuery, TError, TData>["queryKey"];
  },
) => {
  return useQuery<ViewerQuery, TError, TData>({
    queryKey: variables === undefined ? ["Viewer"] : ["Viewer", variables],
    queryFn: fetcher<ViewerQuery, ViewerQueryVariables>(
      ViewerDocument,
      variables,
    ),
    ...options,
  });
};
