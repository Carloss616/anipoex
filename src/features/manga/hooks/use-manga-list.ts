import { NetworkStatus } from "@apollo/client";
import { skipToken, useQuery } from "@apollo/client/react";
import {
  batch,
  type Observable,
  type ObservablePrimitive,
} from "@legendapp/state";
import { useObservable, useValue } from "@legendapp/state/react";
import { useEffect } from "react";
import { downloaded$ } from "@/features/downloads";
import type { MediaListStatus } from "@/graphql/types.generated";
import { session$ } from "@/state/session";
import { MangaListDocument } from "../graphql/manga-list.generated";
import { listOptions$ } from "../state/list-options";
import {
  applyListOptions,
  downloadedIds,
  needsLatest,
} from "../utils/apply-list-options";
import { latestChapterOf } from "../utils/latest-chapter";
import { matchesQuery } from "../utils/matches-query";
import {
  type EntryFields,
  entryFields,
  type MangaEntry,
  toEntries,
} from "../utils/to-entries";

const EMPTY_SET: ReadonlySet<number> = new Set();

/** No genre filter; also its label, first in every genre menu. */
export const ALL = "All genres";

/** Every list query a manual refresh should redo. */
export const REFRESH_QUERIES = ["MangaList", "MangaListCounts"];

/** One list's state, owned by the screen: the genre picked, what's loaded. */
export interface MangaListStore {
  genre: string;
  entries: MangaEntry[];
  fields: Record<number, EntryFields>;
}

export const emptyMangaList = (): MangaListStore => ({
  genre: ALL,
  entries: [],
  fields: {},
});

/** Loads into the caller's `list$`, filtered by the search and its genre. */
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
    batch(() => {
      list$.entries.set(toEntries(data));
      list$.fields.set(entryFields(data));
    });
  }, [data, list$]);

  /**
   * Computeds under a plain root: `useObservable` deactivates only its root on
   * unmount, and Fast Refresh never reactivates it, freezing a root computed.
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
      const base = list$.entries
        .get()
        .filter(
          (m) =>
            (genre === ALL || m.genres?.includes(genre)) &&
            matchesQuery(m, needle),
        );
      const options = listOptions$.get();
      return applyListOptions(base, options, {
        fields: list$.fields.get(),
        // Not read unless needed: a running scan must not recompute the list.
        latest: needsLatest(options) ? latestChapterOf : () => undefined,
        downloaded:
          options.filters.downloaded === "any"
            ? EMPTY_SET
            : downloadedIds(downloaded$.get()),
      });
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
