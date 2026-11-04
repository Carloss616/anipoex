import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersist } from "@/state/observable-persist";
import { mediaKey } from "../utils/msu";

/** A source's page for a manga that the user picked from a title search. */
export interface ManualMatch {
  url: string;
  title: string;
  thumbnailUrl: string | null;
  /** The source's data for the manga; absent on older matches. */
  memo?: string | null;
}

/** Per manga and source, the page set by hand; read before a title search. */
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
