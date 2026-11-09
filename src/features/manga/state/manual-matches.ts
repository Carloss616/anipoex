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
  /**
   * Taken because its title equals one another source's manual match taught,
   * not picked by the user.
   */
  by?: "title";
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

/**
 * The titles of the manga's manual matches, which the matcher also takes on
 * its other sources; `except` leaves one source's out. Tracked, so a title
 * menu in a `Computed` lists a new match.
 */
export const manualTitles = (mangaId: number, except?: string) =>
  Object.entries(manualMatches$[mediaKey(mangaId)].get() ?? {})
    // A page taken by title repeats a known title: it teaches nothing, and
    // would keep teaching a wrong pick after the user removed it.
    .filter(([sourceId, match]) => sourceId !== except && match.by !== "title")
    .map(([, match]) => match.title);

export const clearManual = (mangaId: number, sourceId: string) =>
  manualMatches$[mediaKey(mangaId)][sourceId].delete();
