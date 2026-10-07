import { useObservable } from "@legendapp/state/react";
import { useEffect, useRef } from "react";

/** The search text, debounced so typing doesn't refilter on every key. */
export function useSearchQuery() {
  const query$ = useObservable("");
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(debounce.current), []);

  const setQuery = (text: string) => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => query$.set(text), 150);
  };

  return { query$, setQuery };
}
