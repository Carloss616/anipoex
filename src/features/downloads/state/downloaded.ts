import { batch } from "@legendapp/state";
import { currentStore } from "../utils/current-store";
import type { DownloadStore } from "../utils/download-store";
import { idOf } from "../utils/paths";
import { downloaded$ } from "./download-queue";

/** Lists the store for one manga's source into downloaded$. */
export async function refreshDownloaded(
  mangaId: number,
  sourceId: string,
  store: DownloadStore | undefined = currentStore(),
) {
  if (!store) return;
  const key = `${mangaId}/${sourceId}`;
  // Keys, not the object: Legend edits that one in place.
  const before = new Set(Object.keys(downloaded$[key].peek() ?? {}));
  const files = await store.list(mangaId, sourceId);
  // A chapter that finished during the listing may be missing from it.
  const added = Object.entries(downloaded$[key].peek() ?? {}).filter(
    ([hash]) => !before.has(hash),
  );
  const next = {
    ...Object.fromEntries(added),
    ...Object.fromEntries(
      files.map((f) => [f.hash, f.local ? "local" : "cloud"] as const),
    ),
  };
  batch(() => {
    if (Object.keys(next).length === 0) {
      downloaded$[key].delete();
      return;
    }
    downloaded$[key].set(next);
  });
}

/** The `[mangaId, sourceId]` pairs of `listAll`'s paths, each once. */
export function downloadedPairs(paths: string[]): [number, string][] {
  const pairs = new Map<string, [number, string]>();
  for (const path of paths) {
    const [, manga, source] = path.split("/");
    const mangaId = Number(idOf(manga));
    const sourceId = idOf(source) as string;
    pairs.set(`${mangaId}/${sourceId}`, [mangaId, sourceId]);
  }
  return [...pairs.values()];
}

let seeding: Promise<void> | undefined;

/**
 * Refreshes each manga with downloads that downloaded$ lacks, once per launch:
 * it starts empty, and otherwise fills only as a manga is opened or downloaded.
 */
export function seedDownloaded(store = currentStore()) {
  if (!store) return;
  seeding ??= (async () => {
    for (const [mangaId, sourceId] of downloadedPairs(await store.listAll())) {
      if (downloaded$[`${mangaId}/${sourceId}`].peek()) continue;
      await refreshDownloaded(mangaId, sourceId, store);
    }
  })().catch(() => {
    seeding = undefined;
  });
  return seeding;
}
