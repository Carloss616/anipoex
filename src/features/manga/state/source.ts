import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { toast } from "@/components/ui/toast";
import { runtime, type SourceManga } from "@/features/extensions";
import { ObservablePersist } from "@/state/observable-persist";
import { pickMatch, readMatch, type Titles } from "../utils/source-match";
import { SEARCH_TIMEOUT_MS, withTimeout } from "../utils/with-timeout";
import { readChapters } from "./chapters";

/** Which source each manga's chapter list reads and what it matched, keyed by its AniList id; read through `readMatch`. */
export const source$ = observable<Record<number, unknown>>({});

/** Mangas whose source search is in flight; not persisted. */
export const matching$ = observable<Record<number, boolean>>({});

syncObservable(source$, {
  persist: { name: "source-matches", plugin: ObservablePersist },
});

const tickets: Record<number, number> = {};

/** The source's page for the manga, or null when no result equals a title; rejects when the search fails or times out. */
export async function findManga(
  sourceId: string,
  titles: Titles,
  timeoutMs = SEARCH_TIMEOUT_MS,
): Promise<SourceManga | null> {
  for (const query of new Set(titles.search.filter(Boolean))) {
    const { mangas } = await withTimeout(
      runtime.search(sourceId, query as string, 1),
      timeoutMs,
    );
    const manga = pickMatch(mangas, titles.all);
    if (manga) return manga;
  }
  return null;
}

/** Stores the pick at once, then searches the source for the manga unless its chapters are stored; the last pick per manga wins and a failed search leaves the pick unmatched. Resolves to the stored match (null for none), `{ error }` when the search failed, or undefined when a later pick took over. */
export async function selectSource(
  mangaId: number,
  source: { id: string; name: string },
  titles: Titles,
  timeoutMs = SEARCH_TIMEOUT_MS,
) {
  const ticket = (tickets[mangaId] ?? 0) + 1;
  tickets[mangaId] = ticket;
  source$[mangaId].set({ sourceId: source.id });
  matching$[mangaId].set(true);

  try {
    // A source whose chapters are stored keeps the page it matched then.
    const manga =
      (await readChapters(mangaId, source.id))?.manga ??
      (await findManga(source.id, titles, timeoutMs));
    if (ticket !== tickets[mangaId]) return;
    const match = manga && { url: manga.url, title: manga.title };
    source$[mangaId].set({ sourceId: source.id, manga: match });
    return match;
  } catch (error) {
    if (ticket !== tickets[mangaId]) return;
    toast.destructive(`Couldn't search ${source.name}`);
    return { error };
  } finally {
    if (ticket === tickets[mangaId]) matching$[mangaId].set(false);
  }
}

/** Clears the manga's chosen source when it is `sourceId`, dropping a search still running for it. */
export function deselectSource(mangaId: number, sourceId: string) {
  if (readMatch(source$[mangaId].peek())?.sourceId !== sourceId) return;
  tickets[mangaId] = (tickets[mangaId] ?? 0) + 1;
  source$[mangaId].delete();
  matching$[mangaId].set(false);
}

/** Searches a pick whose search never finished, unless one is running. */
export function resumeSource(
  mangaId: number,
  source: { id: string; name: string },
  titles: Titles,
) {
  const stored = readMatch(source$[mangaId].get());
  if (
    stored?.sourceId !== source.id ||
    stored.manga !== undefined ||
    matching$[mangaId].get()
  )
    return;
  return selectSource(mangaId, source, titles);
}
