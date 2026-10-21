import { observable, syncState, when } from "@legendapp/state";
import { synced } from "@legendapp/state/sync";
import {
  readStoredChapters,
  type StoredChapters,
  writeStoredChapters,
} from "../utils/chapter-storage";

/** Per manga, the chapters its matched source last answered with; each one reads its own entry, on first use. */
export const chapters$ = observable<Record<string, StoredChapters | undefined>>(
  (mangaId: string) =>
    synced<StoredChapters | undefined>({
      get: () => readStoredChapters(Number(mangaId)),
      set: ({ value }) => writeStoredChapters(Number(mangaId), value),
    }),
);

/** The manga's stored chapters once storage answers; undefined when there are none or they can't be read. */
export async function readChapters(mangaId: number) {
  const entry$ = chapters$[mangaId];
  const state$ = syncState(entry$);
  entry$.peek();
  await when(() => state$.isLoaded.get() || !!state$.error.get());
  return entry$.peek();
}
