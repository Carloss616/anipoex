import type { StoredChapters } from "./chapter-storage";

/** One in-memory storage for every test file: Bun applies a `mock.module` to the whole run, so all of them must mock it the same way. */
export const memoryStorage = {
  entries: {} as Record<string, StoredChapters>,
  writes: [] as [string, StoredChapters | undefined][],
  /** Keys whose read fails, like a blocked IndexedDB. */
  failing: new Set<string>(),
  // Async like IndexedDB, so a read has to wait for storage.
  async readStoredChapters(key: string) {
    await new Promise((resolve) => setTimeout(resolve, 1));
    if (memoryStorage.failing.has(key)) throw new Error("blocked");
    return memoryStorage.entries[key];
  },
  writeStoredChapters(key: string, value: StoredChapters | undefined) {
    memoryStorage.writes.push([key, value]);
    if (value) memoryStorage.entries[key] = value;
    else delete memoryStorage.entries[key];
  },
};
