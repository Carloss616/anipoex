import { NetworkStatus } from "@apollo/client";
import { skipToken, useQuery } from "@apollo/client/react";
import { useObservable } from "@legendapp/state/react";
import { useEffect, useMemo } from "react";
import { MangaSearchDocument } from "../graphql/manga-search.generated";
import {
  hasSearch,
  type SearchParams,
  toSearchVariables,
} from "../utils/search-params";
import type { MangaEntry } from "../utils/to-entries";

/** AniList's results for `params`, a page at a time; nothing without params. */
export function useMangaSearch(params: SearchParams) {
  const key = JSON.stringify(params);
  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` is `params`, by value.
  const variables = useMemo(() => toSearchVariables(params, 1), [key]);

  const { data, loading, error, networkStatus, fetchMore, refetch } = useQuery(
    MangaSearchDocument,
    hasSearch(params)
      ? {
          variables,
          notifyOnNetworkStatusChange: true,
          context: { errorMessage: "Couldn't search AniList" },
        }
      : skipToken,
  );

  const manga$ = useObservable<MangaEntry[]>([]);
  useEffect(() => {
    manga$.set(data?.Page?.media?.filter((m) => m != null) ?? []);
  }, [data, manga$]);

  const loadingMore = networkStatus === NetworkStatus.fetchMore;
  const pageInfo = data?.Page?.pageInfo;
  const hasMore = !!pageInfo?.hasNextPage;

  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    void fetchMore({
      // The cache keeps the merged list, so it also knows the last page loaded.
      variables: { page: (pageInfo?.currentPage ?? 1) + 1 },
      updateQuery: (prev, { fetchMoreResult }) => {
        const more = fetchMoreResult.Page;
        if (!more) return prev;
        const seen = new Set(prev.Page?.media?.map((m) => m?.id));
        // AniList's order can shift between pages; a repeat would break the keys.
        const fresh = more.media?.filter((m) => m && !seen.has(m.id)) ?? [];
        return {
          ...fetchMoreResult,
          Page: { ...more, media: [...(prev.Page?.media ?? []), ...fresh] },
        };
      },
    }).catch(() => {});
  };

  return {
    manga$,
    /** The first page, not a page after it. */
    loading: loading && !loadingMore,
    error: !!error,
    hasMore,
    loadMore,
    refetch,
  };
}
