import { useValue } from "@legendapp/state/react";
import { useState } from "react";
import { isRuntimeAvailable, useInstalledSources } from "@/features/extensions";
import { exclusions$, pins$ } from "@/features/manga/state/exclusions";
import { probes$ } from "@/features/manga/state/probes";
import { titleSearch$ } from "@/features/manga/state/title-search";
import { mediaKey } from "@/features/manga/utils/msu";
import {
  applyOrder,
  byTitleResults,
  splitSources,
  titleGroup,
} from "../utils/split-sources";

/** The sources matching the query as available / excluded rows. */
export function useSources({ mangaId }: { mangaId: number }) {
  const [query, setQuery] = useState("");
  const all = useInstalledSources();
  const key = mediaKey(mangaId);
  const excluded = useValue(exclusions$[key]) ?? {};
  const pinned = useValue(pins$[key]) ?? {};

  // Probes and reasons rank the rows live, so a scan sorts the list as each
  // source lands. A string of ids: the sheet re-renders only when the order
  // changes, and its rows keep their objects.
  const ranked = useValue(() => {
    const live = splitSources(
      all,
      exclusions$[key].get() ?? {},
      pins$[key].get() ?? {},
      probes$[key].get() ?? {},
      "",
    );
    return [live.available, live.excluded]
      .map((rows) => rows.map((row) => row.source.id).join(" "))
      .join("|");
  });
  const [availableOrder, excludedOrder] = ranked
    .split("|")
    .map((ids) => ids.split(" ").filter(Boolean));
  // The rows' ages count from when the list opened.
  const [openedAt] = useState(Date.now);

  // While searching by title, sources with results come first. A string of
  // groups, so a page landing in a source already listed changes nothing.
  const groups = useValue(() =>
    Object.entries(titleSearch$[key].get() ?? {})
      .map(([id, rail]) => `${id}:${titleGroup(rail)}`)
      .join(" "),
  );
  const groupOf = (id: string) => {
    const found = groups.split(" ").find((entry) => entry.startsWith(`${id}:`));
    return found ? Number(found.slice(id.length + 1)) : 3;
  };

  const split = splitSources(all, excluded, pinned, {}, query);
  const available = byTitleResults(
    applyOrder(split.available, availableOrder),
    groupOf,
  );
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
    excluded: byTitleResults(
      applyOrder(split.excluded, excludedOrder),
      groupOf,
    ),
    empty,
    openedAt,
  };
}
