import { session$ } from "@/state/session";
import type { TypedDocumentString } from "./graphql";

const GRAPHQL_URL = process.env.EXPO_PUBLIC_ANILIST_GRAPHQL_URL;

export function fetcher<TData, TVariables>(
  query: TypedDocumentString<TData, TVariables>,
  variables?: TVariables,
) {
  if (!GRAPHQL_URL) throw new Error("Missing AniList GraphQL URL");
  const token = session$.token.peek();

  return async (): Promise<TData> => {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
        Accept: "application/graphql-response+json",
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();

    if (json.errors) {
      const { message } = json.errors[0];

      throw new Error(message);
    }

    return json.data;
  };
}
