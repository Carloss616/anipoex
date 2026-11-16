import { requireNativeModule } from "expo";
import { bookmarkOf } from "@/utils/picked-folder";
import type { SyncTarget } from "../sync-tables";
import { SYNC_SUBFOLDER } from "./constants";
import { type ListedFile, readCache } from "./utils";

/** `modules/bookmarked-folder`: a folder kept through a security-scoped bookmark. */
const folder = requireNativeModule<{
  list(bookmark: string, sub: string): Promise<ListedFile[]>;
  read(bookmark: string, sub: string, name: string): Promise<string | null>;
  write(
    bookmark: string,
    sub: string,
    files: Record<string, string>,
  ): Promise<void>;
  remove(bookmark: string, sub: string, names: string[]): Promise<void>;
}>("BookmarkedFolder");

export function createFolderTarget(location: string): SyncTarget {
  const bookmark = bookmarkOf(location);
  const cache = readCache();
  return {
    list: async () => cache.list(await folder.list(bookmark, SYNC_SUBFOLDER)),
    read: (name) =>
      cache.read(
        name,
        async () =>
          (await folder.read(bookmark, SYNC_SUBFOLDER, name)) ?? undefined,
      ),
    write: (files) => folder.write(bookmark, SYNC_SUBFOLDER, files),
    remove: (names) => folder.remove(bookmark, SYNC_SUBFOLDER, names),
  };
}

/** iOS can't watch another app's folder: the foreground and interval syncs cover it. */
export const watchFolder =
  (_location: string, _onChange: () => void) => () => {};
