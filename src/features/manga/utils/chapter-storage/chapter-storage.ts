import type { SourceChapter } from "@/features/extensions";

export interface StoredChapters {
  /** The source's page for the manga, so picking the source again skips its search; its cover shows in the title rail. */
  manga: { url: string; title: string; thumbnailUrl?: string | null };
  chapters: SourceChapter[];
}

const STORE = "chapters";
const OPEN_TIMEOUT_MS = 3000;

let database: Promise<IDBDatabase> | undefined;

// Opened on first use: web's server render has no IndexedDB.
function open() {
  database ??= new Promise((resolve, reject) => {
    const request = indexedDB.open("source-chapters", 2);
    // An older version held open elsewhere stalls this open and every one queued after it.
    const timeout = setTimeout(
      () => fail(new Error("Chapter storage didn't open")),
      OPEN_TIMEOUT_MS,
    );
    // Version 2 keys by manga and source; version 1's records, by manga alone, are dropped.
    request.onupgradeneeded = () => {
      const db = request.result;
      if (db.objectStoreNames.contains(STORE)) db.deleteObjectStore(STORE);
      db.createObjectStore(STORE);
    };
    request.onsuccess = () => {
      clearTimeout(timeout);
      const db = request.result;
      // Make way for a newer version: an open connection blocks its upgrade.
      db.onversionchange = () => {
        db.close();
        database = undefined;
      };
      resolve(db);
    };
    request.onerror = () => fail(request.error);

    function fail(error: unknown) {
      clearTimeout(timeout);
      database = undefined;
      reject(error);
    }
  });
  return database;
}

async function run<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest,
) {
  const db = await open();
  const request = action(db.transaction(STORE, mode).objectStore(STORE));
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as T);
    request.onerror = () => reject(request.error);
  });
}

/** Web and desktop: one IndexedDB record per manga and source, read only when it is needed. */
export function readStoredChapters(key: string) {
  return run<StoredChapters | undefined>("readonly", (store) => store.get(key));
}

export function writeStoredChapters(
  key: string,
  value: StoredChapters | undefined,
) {
  return run("readwrite", (store) =>
    value ? store.put(value, key) : store.delete(key),
  );
}
