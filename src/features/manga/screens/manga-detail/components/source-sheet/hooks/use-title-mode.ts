import { useValue } from "@legendapp/state/react";
import {
  isTitleSearching,
  submitTitleQuery,
  titleQuery$,
} from "@/features/manga/state/title-search";

/** The sheet's title search: while any source searches, the search field holds the title instead of filtering sources. A boolean, so the sheet re-renders only when the mode flips. */
export function useTitleMode(mangaId: number, key: string) {
  const searching = useValue(() => isTitleSearching(key));
  // Tracked, not peeked: the Compiler would keep the first render's read.
  const query = useValue(titleQuery$[key]) ?? "";
  return {
    searching,
    query,
    submit: (query: string) => {
      if (query.trim()) void submitTitleQuery(mangaId, query.trim());
    },
  };
}
