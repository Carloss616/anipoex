import { useValue } from "@legendapp/state/react";
import { titleSearch$ } from "@/features/manga/state/title-search";

/** Whether the source searches by title; read in its own row, so a toggle re-renders that row only. */
export const useSearching = (mangaKey: string, sourceId: string) =>
  useValue(() => titleSearch$[mangaKey][sourceId].get() !== undefined);
