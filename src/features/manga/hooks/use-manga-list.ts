import { NetworkStatus } from "@apollo/client";
import { skipToken, useQuery } from "@apollo/client/react";
import type { Observable, ObservablePrimitive } from "@legendapp/state";
import {
  useObservable,
  useObserveEffect,
  useValue,
} from "@legendapp/state/react";
import { useEffect } from "react";
import type { MediaListStatus } from "@/graphql/types.generated";
import { session$ } from "@/state/session";
import { MangaListDocument } from "../graphql/manga-list.generated";
import { type MangaEntry, toEntries } from "../utils/to-entries";

export const ALL = "All";

export function useMangaList(
  status: MediaListStatus,
  query$: ObservablePrimitive<string>,
  counts$: Observable<Record<MediaListStatus, number | null>>,
) {
  const userId = useValue(session$.user)?.id;

  const { data, loading, networkStatus, refetch } = useQuery(
    MangaListDocument,
    userId == null
      ? skipToken
      : {
          variables: { userId, status },
          context: { errorMessage: "Couldn't load this list" },
        },
  );

  const entries$ = useObservable<MangaEntry[]>([]);
  useEffect(() => {
    entries$.set(toEntries(data));
  }, [data, entries$]);

  const genre$ = useObservable(ALL);

  /**
   * Computeds under a plain root: `useObservable` deactivates only its root node on unmount, and
   * Fast Refresh re-runs effects without ever reactivating it, freezing a computed at the root.
   */
  const derived$ = useObservable({
    genres: () =>
      [
        ALL,
        ...[...new Set(entries$.get().flatMap((m) => m.genres))].sort(),
      ].flatMap((g) => (g ? { name: g, selected: genre$.get() === g } : [])),
    manga: () => {
      const needle = query$.get().trim().toLowerCase();
      const genre = genre$.get();
      return entries$
        .get()
        .filter(
          (m) =>
            (genre === ALL || m.genres?.includes(genre)) &&
            Object.values(m.title ?? {}).some((t) =>
              t?.toLowerCase().includes(needle),
            ),
        );
    },
  });

  useObserveEffect(() => {
    counts$[status].set(derived$.manga.length);
  });

  return {
    manga$: derived$.manga,
    genres$: derived$.genres,
    genre$,
    loading,
    refetching: networkStatus === NetworkStatus.refetch,
    refetch,
  };
}
