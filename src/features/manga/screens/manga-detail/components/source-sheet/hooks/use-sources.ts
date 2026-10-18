import { useValue } from "@legendapp/state/react";
import { useState } from "react";
import { MOCK_SOURCES } from "@/features/manga/sources";
import { theme$ } from "@/state/theme";

/** The sources matching the query, in their own order; where the selected one sits. */
export function useSources(selectedId: string | undefined) {
  const [query, setQuery] = useState("");
  const mode = useValue(theme$.mode);

  const needle = query.trim().toLowerCase();
  const sources = needle
    ? MOCK_SOURCES.filter((source) =>
        source.name.toLowerCase().includes(needle),
      )
    : MOCK_SOURCES;
  const selected = MOCK_SOURCES.find((source) => source.id === selectedId);
  const selectedIndex = sources.findIndex((source) => source.id === selectedId);

  return { query, setQuery, mode, sources, selected, selectedIndex };
}
