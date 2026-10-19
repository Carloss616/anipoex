import { useValue } from "@legendapp/state/react";
import { hasSource, installed$, installedLoaded$ } from "@/features/extensions";
import { matching$, source$ } from "../state/source";
import { readMatch } from "../utils/source-match";

/** The source a manga is matched to and whether that match is still being searched. */
export function useSourceMatch(mangaId: number) {
  const stored = readMatch(useValue(source$[mangaId]));
  const installed = useValue(installed$);
  const loaded = useValue(installedLoaded$);
  const searching = useValue(matching$[mangaId]) ?? false;
  // A match waits for the installed list, then drops if its extension was uninstalled.
  const match =
    stored && loaded && hasSource(installed, stored.sourceId)
      ? stored
      : undefined;
  return { match, matching: searching || (!!stored && !loaded) };
}
