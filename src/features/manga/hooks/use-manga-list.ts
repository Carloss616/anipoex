import type { Observable, ObservablePrimitive } from "@legendapp/state";
import {
  useObservable,
  useObserveEffect,
  useValue,
} from "@legendapp/state/react";
import { useEffect } from "react";
import type { MediaListStatus } from "@/graphql/types";
import { session$ } from "@/state/session";
import { useMangaListQuery } from "../graphql/manga-list.generated";
import { type MangaEntry, toEntries } from "../utils/to-entries";

export const ALL = "All";

export function useMangaList(
  status: MediaListStatus,
  query$: ObservablePrimitive<string>,
  counts$: Observable<Record<MediaListStatus, number | null>>,
) {
  const userId = useValue(session$.user)?.id;

  const { data, isPending, isRefetching, refetch, error } = useMangaListQuery(
    { userId: userId ?? 0, status },
    { enabled: userId != null },
  );

  const entries$ = useObservable<MangaEntry[]>([]);
  useEffect(() => {
    if (data) {
      entries$.set(toEntries(data));
    }
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

  return { manga$, genres$, genre$, isPending, isRefetching, refetch, error };
}
