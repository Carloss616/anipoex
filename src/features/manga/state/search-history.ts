import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersist } from "@/state/observable-persist";

const MAX_ENTRIES = 10;

/** AniList searches the user submitted, newest first. */
export const searchHistory$ = observable<string[]>([]);

syncObservable(searchHistory$, {
  persist: { name: "search-history", plugin: ObservablePersist },
});

/** Moves `q` to the front; the same text in another case counts once. */
export function rememberSearch(q: string) {
  const query = q.trim();
  if (!query) return;
  const key = query.toLowerCase();
  searchHistory$.set([
    query,
    ...searchHistory$
      .peek()
      .filter((entry) => entry.toLowerCase() !== key)
      .slice(0, MAX_ENTRIES - 1),
  ]);
}

export const clearSearchHistory = () => searchHistory$.set([]);

export function matchingHistory(history: string[], draft: string): string[] {
  const key = draft.trim().toLowerCase();
  return key
    ? history.filter((entry) => entry.toLowerCase().includes(key))
    : [];
}
