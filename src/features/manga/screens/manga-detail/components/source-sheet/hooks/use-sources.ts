import { useValue } from "@legendapp/state/react";
import { useRef, useState } from "react";
import { isRuntimeAvailable, useInstalledSources } from "@/features/extensions";
import { exclusions$, pins$ } from "@/features/manga/state/exclusions";
import { probes$ } from "@/features/manga/state/probes";
import { mediaKey } from "@/features/manga/utils/msu";
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
  const all = useInstalledSources();
  const key = mediaKey(mangaId);
  // Probes only rank the rows, and the order holds while open: read them only while closed, so a landing never re-renders the open sheet.
  const probes =
    useValue(() => (isPresented ? undefined : probes$[key].get())) ?? {};
  const excluded = useValue(exclusions$[key]) ?? {};
  const pinned = useValue(pins$[key]) ?? {};

  // The order is set while closed and kept while open, even through a scan; new rows append.
  const order = useRef<string[]>([]);
  if (!isPresented) {
    order.current = splitSources(
      all,
      excluded,
      pinned,
      probes,
      "",
    ).available.map((row) => row.source.id);
  }
  // When the sheet opened: the rows' ages count from it while it stays open.
  const openedAt = useRef(0);
  if (!isPresented) openedAt.current = 0;
  else if (openedAt.current === 0) openedAt.current = Date.now();

  const split = splitSources(all, excluded, pinned, probes, query);
  const available = applyOrder(split.available, order.current);
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
    key,
    all,
    query,
    setQuery,
    available,
    excluded: split.excluded,
    empty,
    openedAt: openedAt.current,
  };
}
