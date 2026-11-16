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
  const files = await store.list(mangaId, sourceId);
  batch(() => {
    if (files.length === 0) {
      downloaded$[key].delete();
      return;
    }
    downloaded$[key].set(
      Object.fromEntries(
        files.map((f) => [f.hash, f.local ? "local" : "cloud"] as const),
      ),
    );
  });
}
