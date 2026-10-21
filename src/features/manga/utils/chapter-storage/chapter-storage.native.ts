import { createMMKV } from "react-native-mmkv";
import type { StoredChapters } from "./chapter-storage";

const storage = createMMKV({ id: "source-chapters" });

/** Native: one MMKV key per manga and source, read only when it is needed. */
export function readStoredChapters(key: string): StoredChapters | undefined {
  const value = storage.getString(key);
  return value ? JSON.parse(value) : undefined;
}

export function writeStoredChapters(
  key: string,
  value: StoredChapters | undefined,
) {
  if (value) storage.set(key, JSON.stringify(value));
  else storage.remove(key);
}
