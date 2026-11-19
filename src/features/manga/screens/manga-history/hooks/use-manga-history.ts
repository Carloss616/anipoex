import { NetworkStatus } from "@apollo/client";
import { skipToken, useQuery } from "@apollo/client/react";
import { useObservable, useValue } from "@legendapp/state/react";
import { useEffect, useState } from "react";
import {
  type HistoryActivityFragment,
  MangaHistoryDocument,
} from "@/features/manga/graphql/manga-history.generated";
import { session$ } from "@/state/session";
import { type HistoryRow, historyRows } from "../utils/history-rows";

/**
 * The viewer's list activity, newest first and a page at a time, as rows
 * grouped by day; only `mediaId`'s when given.
 */
export function useMangaHistory(mediaId: number | undefined) {
  const userId = useValue(session$.user)?.id;

  const { data, loading, error, networkStatus, fetchMore, refetch } = useQuery(
    MangaHistoryDocument,
    userId == null
      ? skipToken
      : {
          // AniList reads a null mediaId as a filter and answers nothing.
          variables: { userId, page: 1, ...(mediaId != null && { mediaId }) },
          fetchPolicy: "cache-and-network",
          notifyOnNetworkStatusChange: true,
          context: { errorMessage: "Couldn't load your history" },
        },
  );

  const rows$ = useObservable<HistoryRow[]>([]);
  useEffect(() => {
    const activities = (data?.Page?.activities ?? []).filter(
      (a): a is HistoryActivityFragment => a?.__typename === "ListActivity",
    );
    rows$.set(historyRows(activities, new Date(), rows$.peek()));
  }, [data, rows$]);

  const loadingMore = networkStatus === NetworkStatus.fetchMore;
  const pageInfo = data?.Page?.pageInfo;
  const hasMore = !!pageInfo?.hasNextPage;

  // The filter a page failed for, so another filter's list starts clean.
  const [failedFor, setFailedFor] = useState<number | null>();
  const moreFailed = failedFor === (mediaId ?? null);
  const loadMore = () => {
    if (!hasMore || loadingMore || loading) return;
    setFailedFor(undefined);
    fetchMore({
      variables: { page: (pageInfo?.currentPage ?? 1) + 1 },
      updateQuery: (prev, { fetchMoreResult }) => {
        const more = fetchMoreResult.Page;
        if (!more) return prev;
        const seen = new Set(
          prev.Page?.activities?.map((a) => a && "id" in a && a.id),
        );
        // New activity shifts AniList's pages; a repeat would break the keys.
        const fresh =
          more.activities?.filter((a) => a && !("id" in a && seen.has(a.id))) ??
          [];
        return {
          ...fetchMoreResult,
          Page: {
            ...more,
            activities: [...(prev.Page?.activities ?? []), ...fresh],
          },
        };
      },
    }).catch(() => setFailedFor(mediaId ?? null));
  };

  return {
    rows$,
    /** The first page, with nothing cached to show meanwhile. */
    loading: loading && !data,
    loadingMore,
    /**
     * A page is loading; the footer remounts when it ends, so one still in
     * view asks again.
     */
    busy: loading || loadingMore,
    error: !!error,
    /** The next page failed to load; `loadMore` tries it again. */
    moreFailed,
    hasMore,
    loadMore,
    refresh: () =>
      refetch()
        .then(() => {})
        .catch(() => {}),
  };
}
