import { createMMKV } from "react-native-mmkv";
import type { StoredChapters } from "./chapter-storage";

const storage = createMMKV({ id: "source-chapters" });

/** Native: one MMKV key per manga, read only when that manga is. */
export function readStoredChapters(
  mangaId: number,
): StoredChapters | undefined {
  const value = storage.getString(String(mangaId));
  return value ? JSON.parse(value) : undefined;
}

export function writeStoredChapters(
  mangaId: number,
  value: StoredChapters | undefined,
) {
  if (value) storage.set(String(mangaId), JSON.stringify(value));
  else storage.remove(String(mangaId));
}
