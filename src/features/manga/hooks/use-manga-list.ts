import { NetworkStatus } from "@apollo/client";
import { skipToken, useQuery } from "@apollo/client/react";
import type { Observable, ObservablePrimitive } from "@legendapp/state";
import { useObservable, useValue } from "@legendapp/state/react";
import { useEffect } from "react";
import type { MediaListStatus } from "@/graphql/types.generated";
import { session$ } from "@/state/session";
import { MangaListDocument } from "../graphql/manga-list.generated";
import { type MangaEntry, toEntries } from "../utils/to-entries";

/** No genre filter; also its label, first in every genre menu. */
export const ALL = "All genres";

/** Every list query a manual refresh or a tracking change should redo. */
export const REFRESH_QUERIES = ["MangaList", "MangaListCounts"];

/** One list's state, owned by the screen: the genre picked and what's loaded. */
export interface MangaListStore {
  genre: string;
  entries: MangaEntry[];
}

export const emptyMangaList = (): MangaListStore => ({
  genre: ALL,
  entries: [],
});

/** One list, loaded into the caller's `list$` and filtered by the search and its genre. */
export function useMangaList(
  status: MediaListStatus,
  query$: ObservablePrimitive<string>,
  list$: Observable<MangaListStore>,
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

  useEffect(() => {
    list$.entries.set(toEntries(data));
  }, [data, list$]);

  /**
   * Computeds under a plain root: `useObservable` deactivates only its root node on unmount, and
   * Fast Refresh re-runs effects without ever reactivating it, freezing a computed at the root.
   */
  const derived$ = useObservable({
    genres: () =>
      genresOf(list$.entries.get()).map((name) => ({
        name,
        selected: list$.genre.get() === name,
      })),
    manga: () => {
      const needle = query$.get().trim().toLowerCase();
      const genre = list$.genre.get();
      return list$.entries
        .get()
        .filter(
          (m) =>
            (genre === ALL || m.genres?.includes(genre)) &&
            [...Object.values(m.title ?? {}), ...(m.synonyms ?? [])].some((t) =>
              t?.toLowerCase().includes(needle),
            ),
        );
    },
  });

  return {
    manga$: derived$.manga,
    genres$: derived$.genres,
    loading,
    refetching: networkStatus === NetworkStatus.refetch,
    refetch,
  };
}

/** `ALL`, then each genre in the list, sorted. */
export function genresOf(entries: MangaEntry[]) {
  const genres = new Set(entries.flatMap((m) => m.genres ?? []));
  return [ALL, ...[...genres].filter((g) => g != null).sort()];
}

export type MangaListState = ReturnType<typeof useMangaList>;
