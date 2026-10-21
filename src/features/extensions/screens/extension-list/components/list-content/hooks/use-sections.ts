import type { ObservablePrimitive } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { useMemo } from "react";
import {
  type Extension,
  type ExtensionFilter,
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

  return useMemo(
    () => toSections(extensions, { filter, language, search }),
    [extensions, filter, language, search],
  );
}
