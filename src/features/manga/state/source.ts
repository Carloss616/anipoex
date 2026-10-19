import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { toast } from "@/components/ui/toast";
import { runtime } from "@/features/extensions";
import { ObservablePersist } from "@/state/observable-persist";
import { pickMatch, readMatch } from "../utils/source-match";

/** Which source each manga's chapter list reads and what it matched, keyed by its AniList id; read through `readMatch`. */
export const source$ = observable<Record<number, unknown>>({});

/** Mangas whose source search is in flight; not persisted. */
export const matching$ = observable<Record<number, boolean>>({});

syncObservable(source$, {
  persist: { name: "manga-source", plugin: ObservablePersist },
});

const tickets: Record<number, number> = {};

const SEARCH_TIMEOUT_MS = 30_000;

/** Rejects when the source does not answer in time, so a hung search ends like a failed one. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Search timed out")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

interface Titles {
  search: (string | null | undefined)[];
  all: (string | null | undefined)[];
}

/** Stores the pick at once, then searches the source for the manga; the last pick per manga wins and a failed search leaves the pick unmatched. */
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
    let manga = null;
    for (const query of new Set(titles.search.filter(Boolean))) {
      const { mangas } = await withTimeout(
        runtime.search(source.id, query as string, 1),
        timeoutMs,
      );
      manga = pickMatch(mangas, titles.all);
      if (manga) break;
    }
    if (ticket !== tickets[mangaId]) return;
    source$[mangaId].set({
      sourceId: source.id,
      manga: manga && { url: manga.url, title: manga.title },
    });
  } catch {
    if (ticket === tickets[mangaId])
      toast.destructive(`Couldn't search ${source.name}`);
  } finally {
    if (ticket === tickets[mangaId]) matching$[mangaId].set(false);
  }
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
