import { observable, syncState, when } from "@legendapp/state";
import { synced } from "@legendapp/state/sync";
import {
  readStoredChapters,
  type StoredChapters,
  writeStoredChapters,
} from "../utils/chapter-storage";
import { isLive } from "../utils/source-exclusions";
import { exclusions$ } from "./exclusions";

/** Where one manga's chapters in one source are kept. */
export const chaptersKey = (mangaId: number | string, sourceId: string) =>
  `${mangaId}/${sourceId}`;

/** Per manga and source, the chapters it last answered with; each entry is read from storage on first use. */
export const chapters$ = observable<Record<string, StoredChapters | undefined>>(
  (key: string) =>
    synced<StoredChapters | undefined>({
      get: () => readStoredChapters(key),
      set: ({ value }) => writeStoredChapters(key, value),
    }),
);

/** The stored chapters once storage answers; undefined when there are none or they can't be read. */
export async function readChapters(mangaId: number, sourceId: string) {
  const entry$ = chapters$[chaptersKey(mangaId, sourceId)];
  const state$ = syncState(entry$);
  entry$.peek();
  await when(() => state$.isLoaded.get() || !!state$.error.get());
  return entry$.peek();
}

function drop(key: string) {
  const entry$ = chapters$[key];
  // An entry never read has nothing in memory, and setting it wouldn't reach storage.
  if (syncState(entry$).isLoaded.peek()) entry$.set(undefined);
  else writeStoredChapters(key, undefined);
}

// A source that becomes excluded loses its stored list.
exclusions$.onChange(({ changes, getPrevious, isFromPersist }) => {
  if (isFromPersist) return;
  const prev = getPrevious() ?? {};
  for (const key of new Set(changes.map(({ path }) => path[0]))) {
    if (!key) continue;
    for (const [sourceId, record] of Object.entries(
      exclusions$[key].peek() ?? {},
    ))
      if (isLive(record) && !isLive(prev[key]?.[sourceId]))
        drop(chaptersKey(key, sourceId));
  }
});
