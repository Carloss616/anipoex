import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { toast } from "@/components/ui/toast";
import { runtime } from "@/features/extensions";
import { ObservablePersist } from "@/state/observable-persist";
import { pickMatch } from "../utils/source-match";

/** Which source each manga's chapter list reads and what it matched, keyed by its AniList id; read through `readMatch`. */
export const source$ = observable<Record<number, unknown>>({});

/** Mangas whose source search is in flight; not persisted. */
export const matching$ = observable<Record<number, boolean>>({});

syncObservable(source$, {
  persist: { name: "manga-source", plugin: ObservablePersist },
});

const tickets: Record<number, number> = {};

/** Searches the source for the manga by its titles; the last pick per manga wins and a failed search keeps the stored match. */
export async function selectSource(
  mangaId: number,
  source: { id: string; name: string },
  titles: {
    search: (string | null | undefined)[];
    all: (string | null | undefined)[];
  },
) {
  const ticket = (tickets[mangaId] = (tickets[mangaId] ?? 0) + 1);
  matching$[mangaId].set(true);

  try {
    let manga = null;
    for (const query of new Set(titles.search.filter(Boolean))) {
      const { mangas } = await runtime.search(source.id, query as string, 1);
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
