/** A stable file name for a remote image, keeping the url path's extension. */
export function widgetFileName(url: string): string {
  let hash = 5381;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash * 33) ^ url.charCodeAt(i)) >>> 0;
  }
  const ext = /\.(png|jpe?g|webp)$/i.exec(url.split(/[?#]/)[0])?.[1];
  return `img-${hash.toString(36)}.${ext?.toLowerCase().replace("jpeg", "jpg") ?? "png"}`;
}

/** Saved images older than this are deleted, once per launch. */
const MAX_AGE_MS = 30 * 86_400_000;
let pruned = false;
// Two notifications asking for one icon at once share its download, and its
// `.part` file.
const loading = new Map<string, Promise<string | undefined>>();

/**
 * Downloads a remote image (or copies a local one) into the widgets directory,
 * where a widget layout can read it, and returns its file uri. Never throws.
 */
export function widgetImage(
  url: string | undefined,
): Promise<string | undefined> {
  if (!url) return Promise.resolve(undefined);
  const name = widgetFileName(url);
  let load = loading.get(name);
  if (!load) {
    load = save(url, name).finally(() => loading.delete(name));
    loading.set(name, load);
  }
  return load;
}

async function save(url: string, name: string) {
  try {
    // Loaded here so the pure helper above imports without native modules.
    const [{ widgetsDirectory }, { Directory, File }] = await Promise.all([
      import("expo-widgets"),
      import("expo-file-system"),
    ]);
    const dir = new Directory(widgetsDirectory);
    if (!pruned) {
      pruned = true;
      const old = Date.now() - MAX_AGE_MS;
      // Only this file's images: the directory may hold the widgets' own.
      for (const item of dir.list())
        if (
          item instanceof File &&
          item.name.startsWith("img-") &&
          (item.modificationTime ?? old) < old
        )
          item.delete();
    }
    const file = new File(dir, name);
    if (file.exists) return file.uri;
    // Android streams into the destination: a cut-off file must not take its name.
    const part = new File(dir, `${name}.part`);
    try {
      // Extension icons aren't urls: the runtime's own files on Android, base64
      // data on iOS.
      // shortcut: a copy isn't refreshed when an extension update redraws its
      // icon; key the name on the file's mtime if that shows.
      if (url.startsWith("file:")) new File(url).copySync(part);
      else if (url.startsWith("data:"))
        await part.write(url.slice(url.indexOf(",") + 1), {
          encoding: "base64",
        });
      else await File.downloadFileAsync(url, part, { idempotent: true });
      part.moveSync(file, { overwrite: true });
    } catch {
      if (part.exists) part.delete();
      return undefined;
    }
    return file.uri;
  } catch {
    return undefined;
  }
}
