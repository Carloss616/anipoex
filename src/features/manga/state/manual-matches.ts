import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersist } from "@/state/observable-persist";
import { mediaKey } from "../utils/msu";

/** A source's page for a manga that the user picked from a title search. */
export interface ManualMatch {
  url: string;
  title: string;
  thumbnailUrl: string | null;
}

/** Per manga, then per source, the page set by hand; read before any title search. */
export const manualMatches$ = observable<
  Record<string, Record<string, ManualMatch>>
>({});

syncObservable(manualMatches$, {
  persist: { name: "source-manual-matches", plugin: ObservablePersist },
});

export const readManual = (mangaId: number, sourceId: string) =>
  manualMatches$[mediaKey(mangaId)][sourceId].peek();

export const setManual = (
  mangaId: number,
  sourceId: string,
  match: ManualMatch,
) => manualMatches$[mediaKey(mangaId)][sourceId].set(match);

export const clearManual = (mangaId: number, sourceId: string) =>
  manualMatches$[mediaKey(mangaId)][sourceId].delete();
