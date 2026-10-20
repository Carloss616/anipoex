import { useValue } from "@legendapp/state/react";
import { useRef, useState } from "react";
import { isRuntimeAvailable, useInstalledSources } from "@/features/extensions";
import { exclusions$, pins$ } from "@/features/manga/state/exclusions";
import { probes$ } from "@/features/manga/state/probes";
import { mediaKey } from "@/features/manga/utils/msu";
import { theme$ } from "@/state/theme";
import { applyOrder, splitSources } from "../utils/split-sources";

/** The sources matching the query as available / excluded rows. */
export function useSources({
  mangaId,
  isPresented,
}: {
  mangaId: number;
  isPresented: boolean;
}) {
  const [query, setQuery] = useState("");
  const mode = useValue(theme$.mode);
  const all = useInstalledSources();
  const key = mediaKey(mangaId);
  const probes = useValue(probes$[key]) ?? {};
  const excluded = useValue(exclusions$[key]) ?? {};
  const pinned = useValue(pins$[key]) ?? {};

  // The order is set each time the sheet opens and kept while it stays open, even through a scan; new rows append.
  const frozen = useRef<string[] | null>(null);
  if (!isPresented) frozen.current = null;
  if (isPresented && frozen.current === null) {
    frozen.current = splitSources(
      all,
      excluded,
      pinned,
      probes,
      "",
    ).available.map((row) => row.source.id);
  }

  const split = splitSources(all, excluded, pinned, probes, query);
  const available = frozen.current
    ? applyOrder(split.available, frozen.current)
    : split.available;
  // Without a query, an empty list means nothing can be picked here yet; say why.
  const needle = query.trim();
  const empty = needle
    ? { title: "No sources found" }
    : !isRuntimeAvailable
      ? { title: "Sources run in the Android, iOS and desktop apps" }
      : {
          title: "No sources installed",
          description: "Install an extension from the Extensions tab.",
        };

  return {
    query,
    setQuery,
    mode,
    available,
    excluded: split.excluded,
    empty,
  };
}
