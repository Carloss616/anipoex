import { useValue } from "@legendapp/state/react";
import { hasSource, installed$, installedLoaded$ } from "@/features/extensions";
import { matching$, source$ } from "../state/source";
import { readMatch } from "../utils/source-match";

/** The manga's matched source, and whether its match is still searching. */
export function useSourceMatch(mangaId: number) {
  const stored = readMatch(useValue(source$[mangaId]));
  const installed = useValue(installed$);
  const loaded = useValue(installedLoaded$);
  const searching = useValue(matching$[mangaId]) ?? false;
  // Waits for the installed list, then drops if the extension was uninstalled.
  const match =
    stored && loaded && hasSource(installed, stored.sourceId)
      ? stored
      : undefined;
  return { match, matching: searching || (!!stored && !loaded) };
}
