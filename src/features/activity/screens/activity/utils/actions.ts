import { activeScans$ } from "@/features/manga/state/active-scans";
import {
  libraryScan$,
  retryAllSkipped,
  retrySkipped,
  scanReading,
  stopReadingScan,
} from "@/features/manga/state/library-scan";
import { stopScan, stopScanAll } from "@/features/manga/state/probes";
import {
  clearQueue,
  removeFromQueue,
  scanNext,
} from "@/features/manga/state/reading-queue";
import { mediaKey } from "@/features/manga/utils/msu";

export { clearQueue, removeFromQueue, retryAllSkipped, retrySkipped, scanNext };

export const stopManga = (mangaId: number) => stopScanAll(mediaKey(mangaId));

export const stopSource = (mangaId: number, sourceId: string) =>
  stopScan(mediaKey(mangaId), sourceId);

/** The Reading scan and every rescan. */
export function stopAll() {
  if (libraryScan$.peek()) stopReadingScan();
  for (const key of Object.keys(activeScans$.peek())) stopScanAll(key);
}

export function startReadingScan() {
  void scanReading();
}
