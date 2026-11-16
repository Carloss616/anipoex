import type { DownloadRoot } from "./download-root";
import type { DownloadStore } from "./download-store/download-store";

export const sameRoot = (a: DownloadRoot, b: DownloadRoot) =>
  a.kind === b.kind &&
  (a.kind === "device" || a.location === (b as typeof a).location);

/**
 * Moves every download of `from` into `to`, one at a time. A file leaves
 * `from` only once `to` has it; a failure keeps it there and goes on.
 * A path `to` already has is skipped and kept: two location strings can name
 * the same folder (a new iOS bookmark, another SAF tree URI), and removing it
 * would delete the only copy.
 */
export async function moveDownloads(
  from: DownloadStore,
  to: DownloadStore,
  onProgress: (done: number, total: number) => void,
) {
  const paths = await from.listAll();
  const there = new Set(await to.listAll());
  let moved = 0;
  let skipped = 0;
  let failed = 0;
  for (const [index, path] of paths.entries()) {
    if (there.has(path)) {
      skipped++;
    } else {
      try {
        await to.put(path, await from.get(path));
        await from.remove(path);
        moved++;
      } catch {
        failed++;
      }
    }
    onProgress(index + 1, paths.length);
  }
  return { moved, skipped, failed };
}

let moving = false;
export const isMoving = () => moving;

/**
 * `moveDownloads`, but undefined while another move runs: two moves in
 * opposite directions could each remove the copy the other just made.
 */
export async function moveOnce(
  ...args: Parameters<typeof moveDownloads>
): Promise<Awaited<ReturnType<typeof moveDownloads>> | undefined> {
  if (moving) return undefined;
  moving = true;
  try {
    return await moveDownloads(...args);
  } finally {
    moving = false;
  }
}
