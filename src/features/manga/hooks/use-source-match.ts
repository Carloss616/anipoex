import { useValue } from "@legendapp/state/react";
import { matching$, source$ } from "../state/source";
import { readMatch } from "../utils/source-match";

/** The source a manga is matched to and whether that match is still being searched. */
export function useSourceMatch(mangaId: number) {
  return {
    match: readMatch(useValue(source$[mangaId])),
    matching: useValue(matching$[mangaId]) ?? false,
  };
}
