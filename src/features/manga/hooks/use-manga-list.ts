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
  const genres$ = useObservable(() =>
    [ALL, ...[...new Set(entries$.get().flatMap((m) => m.genres))].sort()].map(
      (g) => ({ name: g, selected: genre$.get() === g }),
    ),
  );
  const manga$ = useObservable(() => {
    const needle = query$.get().trim().toLowerCase();
    const genre = genre$.get();
    return entries$
      .get()
      .filter(
        (m) =>
          (genre === ALL || m.genres.includes(genre)) &&
          m.titles.some((t) => t.toLowerCase().includes(needle)),
      );
  });

  useObserveEffect(() => {
    counts$[status].set(manga$.length);
  });

  return {
    manga$,
    genres$,
    genre$,
    loading: loading && !data,
    refetching: networkStatus === NetworkStatus.refetch,
    refetch,
  };
}
