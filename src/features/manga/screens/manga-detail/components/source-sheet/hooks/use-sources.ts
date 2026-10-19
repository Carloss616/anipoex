import { useValue } from "@legendapp/state/react";
import { useState } from "react";
import { isRuntimeAvailable, useInstalledSources } from "@/features/extensions";
import { theme$ } from "@/state/theme";

/** The sources matching the query, in their own order; where the selected one sits. */
export function useSources(selectedId: string | undefined) {
  const [query, setQuery] = useState("");
  const mode = useValue(theme$.mode);
  const all = useInstalledSources();

  const needle = query.trim().toLowerCase();
  const sources = needle
    ? all.filter((source) => source.name.toLowerCase().includes(needle))
    : all;
  const selected = all.find((source) => source.id === selectedId);
  const selectedIndex = sources.findIndex((source) => source.id === selectedId);
  // Without a query, an empty list means nothing can be picked here yet; say why.
  const empty = needle
    ? { title: "No sources found" }
    : !isRuntimeAvailable
      ? { title: "Sources run in the Android, iOS and desktop apps" }
      : {
          title: "No sources installed",
          description: "Install an extension from the Extensions tab.",
        };

  return { query, setQuery, mode, sources, selected, selectedIndex, empty };
}
