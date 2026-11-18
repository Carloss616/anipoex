import {
  copyFile,
  mkdir,
  open,
  readdir,
  rename,
  rm,
  rmdir,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** macOS's EDEADLK: a cloud-only file its provider couldn't download yet. */
const NOT_DOWNLOADED = -11;
const READ_TRIES = 3;

/** A path relative to the root: `downloads/…/*.cbz`, nothing that climbs out. */
export function checkRel(rel) {
  const parts = typeof rel === "string" ? rel.split("/") : [];
  if (
    parts.length < 2 ||
    parts[0] !== "downloads" ||
    parts.some((part) => !part || part === "." || part === "..") ||
    parts.some((part) => part.includes("\\") || part.includes("\0")) ||
    !rel.toLowerCase().endsWith(".cbz")
  ) {
    throw new Error("Not a download");
  }
  return rel;
}

const idOf = (name) => [...name.matchAll(/\[([^\]]*)\]/g)].at(-1)?.[1];

/** Same grouping as `groupDownloads` in `src/features/downloads/utils/paths.ts`. */
function group(dir, names) {
  const groups = new Map();
  for (const name of names) {
    if (!name.toLowerCase().endsWith(".cbz")) continue;
    const hash = idOf(name);
    if (!hash) continue;
    const found = groups.get(hash) ?? { hash, paths: [], local: true };
    found.paths.push(`${dir}/${name}`);
    groups.set(hash, found);
  }
  return [...groups.values()];
}

const entries = (dir) =>
  readdir(dir, { withFileTypes: true }).catch((error) => {
    if (error.code === "ENOENT") return [];
    throw error;
  });

const folders = async (dir) =>
  (await entries(dir)).filter((entry) => entry.isDirectory());

export async function list(root, mangaId, sourceId) {
  const base = path.join(root, "downloads");
  // Titles can be renamed: the folders are found by the id in their name.
  const manga = (await folders(base)).find(
    (entry) => idOf(entry.name) === String(mangaId),
  );
  if (!manga) return [];
  const mangaDir = path.join(base, manga.name);
  const source = (await folders(mangaDir)).find(
    (entry) => idOf(entry.name) === sourceId,
  );
  if (!source) return [];
  const files = (await entries(path.join(mangaDir, source.name))).filter(
    (entry) => entry.isFile(),
  );
  return group(
    `downloads/${manga.name}/${source.name}`,
    files.map((entry) => entry.name),
  );
}

/**
 * Same layout check as `isDownloadPath` in `src/features/downloads/utils/paths.ts`:
 * on a case-insensitive disk a root's own `Downloads` folder is `downloads/`.
 */
export function isDownloadPath(rel) {
  const parts = rel.split("/");
  return (
    parts.length === 4 &&
    parts[0] === "downloads" &&
    !!idOf(parts[1]) &&
    !!idOf(parts[2]) &&
    parts[3].toLowerCase().endsWith(".cbz") &&
    /^[0-9a-f]{8}$/.test(idOf(parts[3]) ?? "")
  );
}

export async function listAll(root) {
  const out = [];
  const walk = async (rel, depth) => {
    for (const entry of await entries(path.join(root, rel))) {
      const child = `${rel}/${entry.name}`;
      if (entry.isDirectory()) {
        if (depth < 2) await walk(child, depth + 1);
      } else if (entry.isFile() && isDownloadPath(child)) out.push(child);
    }
  };
  await walk("downloads", 0);
  return out;
}

/** `…/downloads/<manga>/<source>/<chapter>.cbz` in some root: a move's source. */
const isDownload = (file) => {
  const parts = file.split(path.sep);
  const rel = parts.slice(-4).join("/");
  if (parts.length < 5 || parts.at(-4) !== "downloads") return false;
  try {
    return !!checkRel(rel);
  } catch {
    return false;
  }
};

/** `rel` moved into the manga and source folders of the same [id]s, as `list` finds them. */
async function intoExisting(root, rel) {
  const parts = rel.split("/");
  for (const at of [1, 2]) {
    if (at >= parts.length - 1) break;
    const id = idOf(parts[at]);
    if (!id) continue;
    const found = (await folders(path.join(root, ...parts.slice(0, at)))).find(
      (entry) => idOf(entry.name) === id,
    );
    if (found) parts[at] = found.name;
  }
  return parts.join("/");
}

/**
 * Copies a packed chapter, or another root's download, in through a temp file
 * and a rename, replacing.
 */
export async function put(root, rel, fromUri, packedDir) {
  checkRel(rel);
  const from = path.resolve(
    typeof fromUri === "string" && fromUri.startsWith("file:")
      ? fileURLToPath(fromUri)
      : String(fromUri),
  );
  if (
    !from.startsWith(path.resolve(packedDir) + path.sep) &&
    !isDownload(from)
  ) {
    throw new Error("Not a packed chapter");
  }
  const file = path.join(root, await intoExisting(root, rel));
  await mkdir(path.dirname(file), { recursive: true });
  // So a cloud client never uploads half a file.
  const temp = path.join(path.dirname(file), `.${path.basename(file)}.tmp`);
  await copyFile(from, temp);
  await rename(temp, file);
}

/** A `file:` URL the runtime can unpack, once a cloud provider has the file. */
export async function get(root, rel) {
  const file = path.join(root, checkRel(rel));
  for (let tries = 1; ; tries++) {
    try {
      // Opening it makes the provider start the download.
      await (await open(file)).close();
      return pathToFileURL(file).toString();
    } catch (error) {
      if (error.errno !== NOT_DOWNLOADED) throw error;
      if (tries === READ_TRIES) throw new Error("NOT_DOWNLOADED");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

export async function remove(root, rel) {
  const file = path.join(root, checkRel(rel));
  await rm(file, { force: true });
  const stop = path.join(root, "downloads");
  for (let dir = path.dirname(file); dir !== stop; dir = path.dirname(dir)) {
    try {
      await rmdir(dir);
    } catch (error) {
      if (error.code === "ENOTEMPTY" || error.code === "ENOENT") break;
      throw error;
    }
  }
}

/** A page names a root as an absolute folder or `"app"`, the app's own data. */
const resolveRoot = (root, appRoot) => {
  if (root === "app") return appRoot;
  if (typeof root !== "string" || !path.isAbsolute(root)) {
    throw new Error("Not a folder");
  }
  return root;
};

export function registerDownloads(ipcMain, fromApp, { appRoot, packedDir }) {
  ipcMain.handle("downloads", async (event, method, root, ...args) => {
    if (!fromApp(event)) return null;
    const dir = resolveRoot(root, appRoot);
    switch (method) {
      case "list":
        return list(dir, ...args);
      case "listAll":
        return listAll(dir);
      case "put":
        await put(dir, args[0], args[1], packedDir);
        return true;
      case "get":
        return get(dir, args[0]);
      case "remove":
        await remove(dir, args[0]);
        return true;
      default:
        return null;
    }
  });
}
