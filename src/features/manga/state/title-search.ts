import { observable } from "@legendapp/state";
import { runtime, type SourceManga } from "@/features/extensions";
import { mediaKey, PARALLEL_BATCH } from "../utils/msu";
import { SEARCH_TIMEOUT_MS, withTimeout } from "../utils/with-timeout";

/** One source's results for the title being searched, page by page. */
export interface RailState {
  status: "loading" | "done" | "error";
  mangas: SourceManga[];
  page: number;
  hasNextPage: boolean;
  loadingMore: boolean;
  error?: string;
}

/** Per manga, the sources searching by title and what each answered; a source present is searching. Not persisted. */
export const titleSearch$ = observable<
  Record<string, Record<string, RailState>>
>({});

/** Per manga, the title being searched. */
export const titleQuery$ = observable<Record<string, string>>({});

// Per manga and source: a newer request makes an older answer stale.
const tickets: Record<string, number> = {};
const bump = (id: string) => {
  tickets[id] = (tickets[id] ?? 0) + 1;
  return tickets[id];
};

const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const fetchPage = (sourceId: string, query: string, page: number) =>
  withTimeout(runtime.search(sourceId, query, page), SEARCH_TIMEOUT_MS);

const LOADING: RailState = {
  status: "loading",
  mangas: [],
  page: 0,
  hasNextPage: false,
  loadingMore: false,
};

async function loadFirst(
  key: string,
  sourceId: string,
  query: string,
  mine: number,
) {
  const id = `${key}/${sourceId}`;
  try {
    const { mangas, hasNextPage } = await fetchPage(sourceId, query, 1);
    if (tickets[id] !== mine) return;
    titleSearch$[key][sourceId].set({
      status: "done",
      mangas,
      page: 1,
      hasNextPage,
      loadingMore: false,
    });
  } catch (error) {
    if (tickets[id] !== mine) return;
    titleSearch$[key][sourceId].set({
      status: "error",
      mangas: [],
      page: 0,
      hasNextPage: false,
      loadingMore: false,
      error: message(error),
    });
  }
}

/** Searches page 1 of each source for `query`, in batches like a scan. */
export async function startTitleSearch(
  mangaId: number,
  sourceIds: string[],
  query: string,
) {
  const key = mediaKey(mangaId);
  titleQuery$[key].set(query);
  // Every source shows loading at once; later batches wait for the earlier ones.
  const started = sourceIds.map((sourceId) => {
    titleSearch$[key][sourceId].set(LOADING);
    return { sourceId, mine: bump(`${key}/${sourceId}`) };
  });
  for (let i = 0; i < started.length; i += PARALLEL_BATCH)
    await Promise.all(
      started
        .slice(i, i + PARALLEL_BATCH)
        .map(({ sourceId, mine }) => loadFirst(key, sourceId, query, mine)),
    );
}

/** A new title for every source already searching. */
export const submitTitleQuery = (mangaId: number, query: string) =>
  startTitleSearch(
    mangaId,
    Object.keys(titleSearch$[mediaKey(mangaId)].peek() ?? {}),
    query,
  );

/** Appends the source's next page, dropping results already listed; a failure keeps the rows. */
export async function loadMoreTitles(mangaId: number, sourceId: string) {
  const key = mediaKey(mangaId);
  const rail$ = titleSearch$[key][sourceId];
  const rail = rail$.peek();
  if (rail?.status !== "done" || rail.loadingMore || !rail.hasNextPage) return;
  const id = `${key}/${sourceId}`;
  const mine = bump(id);
  rail$.loadingMore.set(true);
  try {
    const { mangas, hasNextPage } = await fetchPage(
      sourceId,
      titleQuery$[key].peek() ?? "",
      rail.page + 1,
    );
    if (tickets[id] !== mine) return;
    const listed = new Set(rail.mangas.map((manga) => manga.url));
    rail$.set({
      status: "done",
      mangas: [
        ...rail.mangas,
        ...mangas.filter((manga) => !listed.has(manga.url)),
      ],
      page: rail.page + 1,
      hasNextPage,
      loadingMore: false,
    });
  } catch (error) {
    if (tickets[id] !== mine) return;
    rail$.assign({ loadingMore: false, error: message(error) });
  }
}

/** Ends the search of one source, or of every source and the title. */
export function stopTitleSearch(mangaId: number, sourceId?: string) {
  const key = mediaKey(mangaId);
  const ids = sourceId
    ? [sourceId]
    : Object.keys(titleSearch$[key].peek() ?? {});
  for (const id of ids) {
    bump(`${key}/${id}`);
    titleSearch$[key][id].delete();
  }
  if (!sourceId) {
    titleSearch$[key].delete();
    titleQuery$[key].delete();
  }
}

/** How many sources of the manga search by title; tracked, for a `Computed` or `useValue`. */
export const searchingCount = (key: string) =>
  Object.keys(titleSearch$[key].get() ?? {}).length;

export const isTitleSearching = (key: string) => searchingCount(key) > 0;
