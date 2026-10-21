import type { SourceChapter } from "@/features/extensions";

export interface StoredChapters {
  sourceId: string;
  url: string;
  chapters: SourceChapter[];
}

const STORE = "chapters";

let database: Promise<IDBDatabase> | undefined;

// Opened on first use: web's server render has no IndexedDB.
function open() {
  database ??= new Promise((resolve, reject) => {
    const request = indexedDB.open("source-chapters", 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
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

/** Web and desktop: one IndexedDB record per manga, read only when that manga is. */
export function readStoredChapters(mangaId: number) {
  return run<StoredChapters | undefined>("readonly", (store) =>
    store.get(mangaId),
  );
}

export function writeStoredChapters(
  mangaId: number,
  value: StoredChapters | undefined,
) {
  return run("readwrite", (store) =>
    value ? store.put(value, mangaId) : store.delete(mangaId),
  );
}
