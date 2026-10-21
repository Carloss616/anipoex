import { useObservable } from "@legendapp/state/react";
import { useDebouncedCallback } from "./use-debounced-callback";

/**
 * The text of a `Stack.SearchBar`, debounced, as an observable: only the
 * component that renders the results reads it, so the screen doesn't rerender
 * while typing. An in-content `SearchBar` passes `debounce` and
 * `onDebouncedChange` instead.
 */
export function useSearchQuery() {
  const query$ = useObservable("");
  const { run: setQuery } = useDebouncedCallback(
    (text: string) => query$.set(text),
    150,
  );

  return { query$, setQuery };
}
