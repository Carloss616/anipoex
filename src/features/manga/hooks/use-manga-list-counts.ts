import { skipToken, useQuery } from "@apollo/client/react";
import { useValue } from "@legendapp/state/react";
import { useMemo } from "react";
import { AppState } from "react-native";
import { client } from "@/graphql/client";
import { session$ } from "@/state/session";
import { MangaListCountsDocument } from "../graphql/manga-list.generated";
import { toCounts, toCustomLists } from "../utils/to-counts";

// Counts and custom lists change on other devices too: refresh them on return.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    void client
      .refetchQueries({ include: ["MangaListCounts"] })
      .catch(() => {});
  }
});

/**
 * Cached first, then AniList's: the persisted cache would otherwise keep
 * showing what the last session saw. Silent, since the counts are secondary.
 */
function useCountsQuery() {
  const userId = useValue(session$.user)?.id;
  return useQuery(
    MangaListCountsDocument,
    userId == null
      ? skipToken
      : {
          variables: { userId },
          fetchPolicy: "cache-and-network",
          nextFetchPolicy: "cache-first",
          context: { silent: true },
        },
  ).data;
}

/** Totals for every list, in one light query (ids only). */
export function useMangaListCounts() {
  const data = useCountsQuery();
  return useMemo(() => toCounts(data), [data]);
}

/** The account's custom lists with their totals, null until loaded. */
export function useCustomLists() {
  const data = useCountsQuery();
  return useMemo(() => toCustomLists(data), [data]);
}
