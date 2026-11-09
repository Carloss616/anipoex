import type { ObservablePrimitive } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { useMemo } from "react";
import {
  type Extension,
  type ExtensionFilter,
  languages$,
  toSections,
} from "@/features/extensions";

/** The sections to show; reads the search here so only the list rerenders. */
export function useSections({
  extensions,
  filter,
  language,
  query$,
}: {
  extensions: Extension[];
  filter: ExtensionFilter;
  language: string | undefined;
  query$: ObservablePrimitive<string>;
}) {
  const search = useValue(query$);
  // A string, so a new array with the same languages changes nothing.
  const preferred = useValue(() => languages$.get().join());

  return useMemo(
    () =>
      toSections(extensions, {
        filter,
        language,
        search,
        preferred: preferred.split(","),
      }),
    [extensions, filter, language, search, preferred],
  );
}
