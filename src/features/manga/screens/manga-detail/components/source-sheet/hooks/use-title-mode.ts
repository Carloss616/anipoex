import { useObservable, useObserve, useValue } from "@legendapp/state/react";
import { useState } from "react";
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
  // What was typed over the query; an observable, so a keystroke re-renders only what reads it.
  const input$ = useObservable<string | null>(null);
  // The field keeps its own text: a pick remounts it, even one that repeats the query.
  const [picks, setPicks] = useState(0);
  // A new query, or none when title search ends, remounts the field on the query.
  useObserve(titleQuery$[key], () => input$.set(null));

  const submit = (query: string) => {
    if (query.trim()) void submitTitleQuery(mangaId, query.trim());
  };
  return {
    searching,
    query,
    fieldKey: `titles-${query}-${picks}`,
    submit,
    type: (text: string) => input$.set(text),
    /** The field's text. Tracked: read it in a `Computed`. */
    fieldText: () => input$.get() ?? query,
    pick: (title: string) => {
      input$.set(null);
      setPicks((count) => count + 1);
      submit(title);
    },
  };
}
