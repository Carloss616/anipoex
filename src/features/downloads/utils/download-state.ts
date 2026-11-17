import { downloaded$, downloadQueue$ } from "../state/download-queue";
import { chapterHash, downloadKey } from "./paths";

export type DownloadState =
  | "none"
  | "queued"
  | "running"
  | "paused"
  | "failed"
  | "local"
  | "cloud";

/** Tracked with `get()`, so `useValue(() => downloadStateOf(…))` re-renders only when it changes. */
export function downloadStateOf(
  mangaId: number,
  sourceId: string,
  url: string,
): DownloadState {
  const hash = chapterHash(url);
  return (
    downloadQueue$[downloadKey(mangaId, sourceId, hash)].state.get() ??
    downloaded$[`${mangaId}/${sourceId}`][hash].get() ??
    "none"
  );
}
