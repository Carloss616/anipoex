import { Directory, File, type FileHandle, FileMode } from "expo-file-system";
import type { DownloadStore } from "./download-store/download-store";
import { NotDownloadedError } from "./download-store/utils/errors";
import { groupDownloads, idOf, isDownloadPath } from "./paths";
import { type FolderEntry, saf } from "./saf";

// A provider keeps the display name as given for this type; others may append an extension.
const MIME = "application/octet-stream";
const CHUNK = 1024 * 1024;

/** A file:// entry's name: its URI's last segment, decoded. */
const nameOf = (uri: string) =>
  decodeURIComponent(uri).split(/[/:]/).filter(Boolean).pop() ?? uri;

/**
 * A store over a `Directory`: the app's storage, or a SAF folder on Android.
 * It remembers each folder's listing until it changes that folder, so one
 * operation (a delete, then its refresh) walks the tree once.
 */
export function fileSystemStore(root: Directory): DownloadStore {
  // SAF lists and deletes off the JS thread: Directory.list() runs on it and
  // looks up each entry's type, ~10 ms an entry (300 ms for 31 manga on an
  // emulator), and a delete took 300 ms there too.
  const native = root.uri.startsWith("content://") ? saf : undefined;
  const listings = new Map<string, FolderEntry[]>();
  const ls = async (dir: Directory) => {
    let entries = listings.get(dir.uri);
    if (!entries) {
      entries = native
        ? await native.list(dir.uri)
        : dir.list().map((entry) => ({
            name: nameOf(entry.uri),
            uri: entry.uri,
            dir: entry instanceof Directory,
          }));
      listings.set(dir.uri, entries);
    }
    return entries;
  };
  const child = async (dir: Directory, match: (name: string) => boolean) =>
    (await ls(dir)).find((entry) => match(entry.name));
  const subdir = async (
    dir: Directory | undefined,
    match: (name: string) => boolean,
  ) => {
    const found = dir && (await child(dir, match));
    return found?.dir ? new Directory(found.uri) : undefined;
  };
  /** Deletes an entry of `dir` and forgets both listings. */
  const drop = async (dir: Directory, entry: FolderEntry) => {
    if (native) await native.delete(entry.uri);
    else (entry.dir ? new Directory(entry.uri) : new File(entry.uri)).delete();
    listings.delete(dir.uri);
    listings.delete(entry.uri);
  };
  const named = (name: string) => (n: string) => n === name;
  /** A manga or source folder by its [id], so a renamed one keeps its chapters. */
  const sameId = (name: string) => {
    const id = idOf(name);
    return id ? (n: string) => idOf(n) === id : named(name);
  };
  /** The folders down to `parts`, root first; shorter when one is missing. */
  const dirsAt = async (parts: string[]) => {
    const dirs = [root];
    for (const part of parts) {
      const next = await subdir(dirs.at(-1), named(part));
      if (!next) break;
      dirs.push(next);
    }
    return dirs;
  };
  const fileAt = async (path: string) => {
    const parts = path.split("/");
    const name = parts.pop() as string;
    const dirs = await dirsAt(parts);
    if (dirs.length <= parts.length) return undefined;
    const found = await child(dirs[parts.length], named(name));
    return found && !found.dir ? found : undefined;
  };

  return {
    async list(mangaId, sourceId) {
      const downloads = await subdir(root, named("downloads"));
      const manga =
        downloads &&
        (await child(downloads, (n) => idOf(n) === String(mangaId)));
      if (!manga?.dir) return [];
      const source = await child(
        new Directory(manga.uri),
        (n) => idOf(n) === sourceId,
      );
      if (!source?.dir) return [];
      return groupDownloads(
        `downloads/${manga.name}/${source.name}`,
        (await ls(new Directory(source.uri)))
          .filter((entry) => !entry.dir)
          .map((entry) => ({ name: entry.name, local: true })),
      );
    },
    async listAll() {
      const out: string[] = [];
      const walk = async (dir: Directory, rel: string, depth: number) => {
        for (const entry of await ls(dir)) {
          const path = `${rel}/${entry.name}`;
          if (entry.dir) {
            if (depth < 2)
              await walk(new Directory(entry.uri), path, depth + 1);
          } else if (isDownloadPath(path)) out.push(path);
        }
      };
      const downloads = await subdir(root, named("downloads"));
      if (downloads) await walk(downloads, "downloads", 0);
      return out;
    },
    async put(path, fileUri) {
      const parts = path.split("/");
      const name = parts.pop() as string;
      let dir = root;
      for (const part of parts) {
        const next = await subdir(dir, sameId(part));
        if (!next) listings.delete(dir.uri);
        dir = next ?? dir.createDirectory(part);
      }
      // A new document each time, since some providers don't truncate on overwrite;
      // `copy` onto it would delete it first on SAF, and SAF has no rename for a temp name.
      const old = await child(dir, named(name));
      if (old) await drop(dir, old);
      listings.delete(dir.uri);
      let input: FileHandle | undefined;
      let target: File | undefined;
      let output: FileHandle | undefined;
      try {
        input = new File(fileUri).open(FileMode.ReadOnly);
        target = dir.createFile(name, MIME);
        output = target.open(FileMode.WriteOnly);
        for (;;) {
          const bytes = await input.readBytes(CHUNK);
          if (!bytes.length) break;
          await output.writeBytes(bytes);
        }
      } catch (error) {
        // A half-written or empty file would list as a download.
        output?.close();
        output = undefined;
        target?.delete();
        throw error;
      } finally {
        input?.close();
        output?.close();
      }
    },
    async get(path) {
      const file = await fileAt(path);
      if (!file) throw new NotDownloadedError(path);
      // Android's runtime opens a content:// URI itself; app storage is file://.
      return file.uri;
    },
    async remove(path) {
      const parts = path.split("/");
      const name = parts.pop() as string;
      const dirs = await dirsAt(parts);
      if (dirs.length <= parts.length) return;
      const file = await child(dirs[parts.length], named(name));
      if (file) await drop(dirs[parts.length], file);
      // Emptied folders go too, up to `downloads`.
      for (let at = parts.length; at > 1; at--) {
        if ((await ls(dirs[at])).length) break;
        await drop(dirs[at - 1], {
          name: parts[at - 1],
          uri: dirs[at].uri,
          dir: true,
        });
      }
    },
  };
}
