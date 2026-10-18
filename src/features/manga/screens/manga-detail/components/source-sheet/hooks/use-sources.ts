import { useValue } from "@legendapp/state/react";
import { useState } from "react";
import { useTrackingEntry } from "@/features/manga/hooks/use-tracking-entry";
import { MOCK_SOURCES } from "@/features/manga/sources";
import { theme$ } from "@/state/theme";

/** The sources matching the query, the selected one first. */
export function useSources(
  entryId: number | null | undefined,
  selectedId: string | undefined,
) {
  const [query, setQuery] = useState("");
  const mode = useValue(theme$.mode);
  const progress = useTrackingEntry(entryId)?.progress;

  const needle = query.trim().toLowerCase();
  const matches = needle
    ? MOCK_SOURCES.filter((source) =>
        source.name.toLowerCase().includes(needle),
      )
    : MOCK_SOURCES;

  const selected = matches.find((source) => source.id === selectedId);
  const sources = selected
    ? [selected, ...matches.filter((source) => source !== selected)]
    : matches;

  return { query, setQuery, mode, progress, sources };
}
