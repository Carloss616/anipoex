import {
  cancel as cancelDownload,
  moveUp as moveDownloadUp,
  pauseDownloads,
  resumeDownloads,
  retryDownload,
} from "@/features/downloads";
import { activeScans$ } from "@/features/manga/state/active-scans";
import {
  libraryScan$,
  retryAllSkipped,
  retrySkipped,
  scanReading,
  stopReadingScan,
} from "@/features/manga/state/library-scan";
import { pendingEntries$ } from "@/features/manga/state/pending-entries";
import { stopScan, stopScanAll } from "@/features/manga/state/probes";
import {
  clearQueue,
  removeFromQueue,
  scanNext,
} from "@/features/manga/state/reading-queue";
import { sendPending } from "@/features/manga/state/send-pending";
import { mediaKey } from "@/features/manga/utils/msu";

export {
  cancelDownload,
  clearQueue,
  moveDownloadUp,
  pauseDownloads,
  removeFromQueue,
  resumeDownloads,
  retryAllSkipped,
  retryDownload,
  retrySkipped,
  scanNext,
};

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

export function retryUnsent(mediaId: string) {
  pendingEntries$[mediaId].error.delete();
  void sendPending();
}

export const discardUnsent = (mediaId: string) =>
  pendingEntries$[mediaId].delete();
