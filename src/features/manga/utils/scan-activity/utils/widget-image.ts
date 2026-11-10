/** A stable file name for a remote image, keeping the url path's extension. */
export function widgetFileName(url: string): string {
  let hash = 5381;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash * 33) ^ url.charCodeAt(i)) >>> 0;
  }
  const ext = /\.(png|jpe?g|webp)$/i.exec(url.split(/[?#]/)[0])?.[1];
  return `img-${hash.toString(36)}.${ext?.toLowerCase().replace("jpeg", "jpg") ?? "png"}`;
}

/**
 * Downloads a remote image (or copies a local one) into the widgets directory,
 * where a widget layout can read it, and returns its file uri. Never throws.
 */
export async function widgetImage(
  url: string | undefined,
): Promise<string | undefined> {
  if (!url) return undefined;
  try {
    // Loaded here so the pure helper above imports without native modules.
    const [{ widgetsDirectory }, { Directory, File }] = await Promise.all([
      import("expo-widgets"),
      import("expo-file-system"),
    ]);
    const dir = new Directory(widgetsDirectory);
    const name = widgetFileName(url);
    const file = new File(dir, name);
    if (file.exists) return file.uri;
    // Android streams into the destination: a cut-off file must not take its name.
    const part = new File(dir, `${name}.part`);
    try {
      // Android's extension icons are the runtime's own files, not urls.
      // shortcut: a copy isn't refreshed when an extension update redraws its
      // icon; key the name on the file's mtime if that shows.
      if (url.startsWith("file:")) new File(url).copySync(part);
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
