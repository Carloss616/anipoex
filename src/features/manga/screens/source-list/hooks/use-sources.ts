import { useValue } from "@legendapp/state/react";
import { useState } from "react";
import { isRuntimeAvailable, useInstalledSources } from "@/features/extensions";
import { exclusions$, pins$ } from "@/features/manga/state/exclusions";
import { probes$ } from "@/features/manga/state/probes";
import { mediaKey } from "@/features/manga/utils/msu";
import { applyOrder, splitSources } from "../utils/split-sources";

/** The sources matching the query as available / excluded rows. */
export function useSources({ mangaId }: { mangaId: number }) {
  const [query, setQuery] = useState("");
  const all = useInstalledSources();
  const key = mediaKey(mangaId);
  const excluded = useValue(exclusions$[key]) ?? {};
  const pinned = useValue(pins$[key]) ?? {};

  // Probes only rank the rows, once, as the list opens: the order holds even
  // through a scan, so a landing never re-renders it; new rows append.
  const [order] = useState(() =>
    splitSources(
      all,
      excluded,
      pinned,
      probes$[key].peek() ?? {},
      "",
    ).available.map((row) => row.source.id),
  );
  // The rows' ages count from when the list opened.
  const [openedAt] = useState(Date.now);

  const split = splitSources(all, excluded, pinned, {}, query);
  const available = applyOrder(split.available, order);
  // Without a query, an empty list means nothing can be picked yet; say why.
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
    openedAt,
  };
}
