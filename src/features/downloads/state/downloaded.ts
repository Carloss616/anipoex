import { batch } from "@legendapp/state";
import { noop } from "@/utils/utils";
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

/**
 * Lists every manga and source with files into downloaded$, at startup and on
 * a list's refresh: the cards and source rows count them before any detail
 * opens. The ones already shown are listed too, so a folder gone since clears.
 */
export async function loadDownloaded(
  store: DownloadStore | undefined = currentStore(),
) {
  if (!store) return;
  const pairs = new Set([
    ...(await store.listAll()).map((path) => {
      const [, manga, source] = path.split("/");
      return `${idOf(manga)}/${idOf(source)}`;
    }),
    ...Object.keys(downloaded$.peek() ?? {}),
  ]);
  // One at a time: a picked iOS folder walks its whole tree per listing.
  for (const pair of pairs) {
    const at = pair.indexOf("/");
    await refreshDownloaded(
      Number(pair.slice(0, at)),
      pair.slice(at + 1),
      store,
    ).catch(noop);
  }
}
