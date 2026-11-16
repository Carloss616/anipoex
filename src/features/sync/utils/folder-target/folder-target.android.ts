import { Directory, File } from "expo-file-system";
import type { SyncTarget } from "../sync-tables";
import { SYNC_SUBFOLDER } from "./constants";
import { readCache } from "./utils";

const MIME = "application/json";

/** A SAF document's name: its URI's last segment, decoded; a picked tree ends in `/`. */
const nameOf = (uri: string) =>
  decodeURIComponent(uri).split(/[/:]/).filter(Boolean).pop() ?? uri;

export const canUseFolder = true;

/** A folder picked through the system picker; its permission persists. */
export async function pickFolder() {
  return (await Directory.pickDirectoryAsync()).uri;
}

export const folderName = nameOf;

/**
 * The folder as a sync target. Android has no sync client for Drive or
 * OneDrive folders: a separate sync app keeps it in sync.
 */
export function createFolderTarget(location: string): SyncTarget {
  const syncDir = (create: boolean) => {
    const root = new Directory(location);
    const found = root
      .list()
      .find(
        (entry): entry is Directory =>
          entry instanceof Directory && nameOf(entry.uri) === SYNC_SUBFOLDER,
      );
    return found ?? (create ? root.createDirectory(SYNC_SUBFOLDER) : undefined);
  };
  const files = () =>
    (syncDir(false)?.list() ?? []).filter(
      (entry): entry is File => entry instanceof File,
    );

  const cache = readCache();
  // Each SAF listing is a round trip to the provider: reads use the last one.
  let listed = new Map<string, File>();

  return {
    async list() {
      listed = new Map(files().map((file) => [nameOf(file.uri), file]));
      return cache.list(
        [...listed].map(([name, file]) => {
          const { modificationTime, size } = file.info();
          return { name, version: `${modificationTime}:${size}` };
        }),
      );
    },
    read: (name) => cache.read(name, async () => listed.get(name)?.text()),
    async write(next) {
      const dir = syncDir(true) as Directory;
      const current = files();
      for (const [name, text] of Object.entries(next)) {
        // Some providers' "w" mode doesn't truncate: a shorter file would
        // keep the old one's tail. A new document each time can't.
        current.find((file) => nameOf(file.uri) === name)?.delete();
        await dir.createFile(name, MIME).write(text);
      }
    },
    async remove(names) {
      for (const file of files()) {
        if (names.includes(nameOf(file.uri))) file.delete();
      }
    },
  };
}

/** SAF folders can't be watched: the foreground and interval syncs cover it. */
export const watchFolder =
  (_location: string, _onChange: () => void) => () => {};
