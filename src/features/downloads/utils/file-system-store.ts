import { Directory, File, FileMode } from "expo-file-system";
import type { DownloadStore } from "./download-store/download-store";
import { NotDownloadedError } from "./download-store/utils/errors";
import { groupDownloads, idOf, isDownloadPath } from "./paths";

// A provider keeps the display name as given for this type; others may append an extension.
const MIME = "application/octet-stream";
const CHUNK = 1024 * 1024;

// shortcut: the name comes from the URI, which holds the path only on providers whose
// document id is the path (local storage); opaque ids need a display-name lookup.
/** A SAF document's name: its URI's last segment, decoded. */
const nameOf = (uri: string) =>
  decodeURIComponent(uri).split(/[/:]/).filter(Boolean).pop() ?? uri;

const child = (dir: Directory, match: (name: string) => boolean) =>
  dir.list().find((entry) => match(nameOf(entry.uri)));

const subdir = (
  dir: Directory | undefined,
  match: (name: string) => boolean,
) => {
  const found = dir && child(dir, match);
  return found instanceof Directory ? found : undefined;
};

/** A store over a `Directory`: the app's storage, or a SAF folder on Android. */
export function fileSystemStore(root: Directory): DownloadStore {
  const named = (name: string) => (n: string) => n === name;
  const fileAt = (path: string) => {
    const parts = path.split("/");
    const name = parts.pop() as string;
    let dir: Directory | undefined = root;
    for (const part of parts) dir = subdir(dir, named(part));
    const found = dir && child(dir, named(name));
    return found instanceof File ? found : undefined;
  };

  return {
    async list(mangaId, sourceId) {
      const manga = subdir(
        subdir(root, named("downloads")),
        (n) => idOf(n) === String(mangaId),
      );
      const source = subdir(manga, (n) => idOf(n) === sourceId);
      if (!manga || !source) return [];
      return groupDownloads(
        `downloads/${nameOf(manga.uri)}/${nameOf(source.uri)}`,
        source
          .list()
          .filter((entry) => entry instanceof File)
          .map((entry) => ({ name: nameOf(entry.uri), local: true })),
      );
    },
    async listAll() {
      const out: string[] = [];
      const walk = (dir: Directory, rel: string, depth: number) => {
        for (const entry of dir.list()) {
          const path = `${rel}/${nameOf(entry.uri)}`;
          if (entry instanceof Directory) {
            if (depth < 2) walk(entry, path, depth + 1);
          } else if (isDownloadPath(path)) out.push(path);
        }
      };
      const downloads = subdir(root, named("downloads"));
      if (downloads) walk(downloads, "downloads", 0);
      return out;
    },
    async put(path, fileUri) {
      const parts = path.split("/");
      const name = parts.pop() as string;
      let dir = root;
      for (const part of parts) {
        dir = subdir(dir, named(part)) ?? dir.createDirectory(part);
      }
      // A new document each time, since some providers don't truncate on overwrite;
      // `copy` onto it would delete it first on SAF, and SAF has no rename for a temp name.
      child(dir, named(name))?.delete();
      const input = new File(fileUri).open(FileMode.ReadOnly);
      const target = dir.createFile(name, MIME);
      const output = target.open(FileMode.WriteOnly);
      try {
        for (;;) {
          const bytes = await input.readBytes(CHUNK);
          if (!bytes.length) break;
          await output.writeBytes(bytes);
        }
      } catch (error) {
        // A half-written file would list as a download.
        output.close();
        target.delete();
        throw error;
      } finally {
        input.close();
        output.close();
      }
    },
    async get(path) {
      const file = fileAt(path);
      if (!file) throw new NotDownloadedError(path);
      // Android's runtime opens a content:// URI itself; app storage is file://.
      return file.uri;
    },
    async remove(path) {
      fileAt(path)?.delete();
      const parts = path.split("/").slice(0, -1);
      for (let depth = parts.length; depth > 1; depth--) {
        let dir: Directory | undefined = root;
        for (const part of parts.slice(0, depth))
          dir = subdir(dir, named(part));
        if (!dir || dir.list().length) break;
        dir.delete();
      }
    },
  };
}
