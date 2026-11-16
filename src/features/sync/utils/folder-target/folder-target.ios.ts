import { requireNativeModule } from "expo";
import type { SyncTarget } from "../sync-tables";
import { SYNC_SUBFOLDER } from "./constants";

/** `modules/bookmarked-folder`: a folder kept through a security-scoped bookmark. */
const folder = requireNativeModule<{
  pick(): Promise<{ bookmark: string; name: string } | null>;
  list(bookmark: string, sub: string): Promise<string[]>;
  read(bookmark: string, sub: string, name: string): Promise<string | null>;
  write(
    bookmark: string,
    sub: string,
    files: Record<string, string>,
  ): Promise<void>;
  remove(bookmark: string, sub: string, names: string[]): Promise<void>;
}>("BookmarkedFolder");

export const canUseFolder = true;

/**
 * The location is the folder's name and its bookmark, so the row can name it
 * without asking iOS: `<name>\n<bookmark>`.
 */
export async function pickFolder() {
  const picked = await folder.pick();
  return picked ? `${picked.name}\n${picked.bookmark}` : undefined;
}

const parse = (location: string) => {
  const cut = location.indexOf("\n");
  return { name: location.slice(0, cut), bookmark: location.slice(cut + 1) };
};

export const folderName = (location: string) => parse(location).name;

export function createFolderTarget(location: string): SyncTarget {
  const { bookmark } = parse(location);
  return {
    list: () => folder.list(bookmark, SYNC_SUBFOLDER),
    read: async (name) =>
      (await folder.read(bookmark, SYNC_SUBFOLDER, name)) ?? undefined,
    write: (files) => folder.write(bookmark, SYNC_SUBFOLDER, files),
    remove: (names) => folder.remove(bookmark, SYNC_SUBFOLDER, names),
  };
}

/** iOS can't watch another app's folder: the foreground and interval syncs cover it. */
export const watchFolder =
  (_location: string, _onChange: () => void) => () => {};
