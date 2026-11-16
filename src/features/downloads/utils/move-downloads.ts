import type { DownloadRoot } from "./download-root";
import type { DownloadStore } from "./download-store/download-store";

export const sameRoot = (a: DownloadRoot, b: DownloadRoot) =>
  a.kind === b.kind &&
  (a.kind === "device" || a.location === (b as typeof a).location);

/**
 * Moves every download of `from` into `to`, one at a time. A file leaves
 * `from` only once `to` has it; a failure keeps it there and goes on.
 */
export async function moveDownloads(
  from: DownloadStore,
  to: DownloadStore,
  onProgress: (done: number, total: number) => void,
) {
  const paths = await from.listAll();
  const there = new Set(await to.listAll());
  let moved = 0;
  let failed = 0;
  for (const [index, path] of paths.entries()) {
    try {
      if (there.has(path)) {
        await from.remove(path);
      } else {
        await to.put(path, await from.get(path));
        await from.remove(path);
        moved++;
      }
    } catch {
      failed++;
    }
    onProgress(index + 1, paths.length);
  }
  return { moved, failed };
}
