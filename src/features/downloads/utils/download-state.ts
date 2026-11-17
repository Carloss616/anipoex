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

/** Chapters downloaded from one source, tracked like `downloadStateOf`. */
export const sourceDownloads = (mangaId: number, sourceId: string) =>
  Object.keys(downloaded$[`${mangaId}/${sourceId}`].get() ?? {}).length;

/** Chapters downloaded from all of a manga's sources. */
export function mangaDownloads(mangaId: number) {
  const prefix = `${mangaId}/`;
  let count = 0;
  for (const [key, files] of Object.entries(downloaded$.get()))
    if (key.startsWith(prefix)) count += Object.keys(files).length;
  return count;
}
