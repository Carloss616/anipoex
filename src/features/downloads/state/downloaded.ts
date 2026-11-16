import { batch } from "@legendapp/state";
import { currentStore } from "../utils/current-store";
import type { DownloadStore } from "../utils/download-store";
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
