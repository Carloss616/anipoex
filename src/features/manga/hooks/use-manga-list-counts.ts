import { skipToken, useQuery } from "@apollo/client/react";
import { useValue } from "@legendapp/state/react";
import { useMemo } from "react";
import { session$ } from "@/state/session";
import { MangaListCountsDocument } from "../graphql/manga-list-counts.generated";
import { toCounts } from "../utils/to-counts";

/** Totals for every list, in one light query (ids only). */
export function useMangaListCounts() {
  const userId = useValue(session$.user)?.id;
  const { data } = useQuery(
    MangaListCountsDocument,
    userId == null ? skipToken : { variables: { userId } },
  );

  return useMemo(() => toCounts(data), [data]);
}
