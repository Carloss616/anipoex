import type { QueuedDownload } from "@/features/downloads";

/** The chapter as the source names it, or its number when it has no name. */
export const chapterLabel = (number: number, name: string) =>
  name || (number >= 0 ? `Chapter ${number}` : "Chapter");

/** Under the title when it isn't running: the chapter and its state. */
export function downloadLine(
  chapter: string,
  state: QueuedDownload["state"],
  error: string | undefined,
  paused: boolean,
) {
  if (state === "failed") return `${chapter} · ${error || "Failed"}`;
  return `${chapter} · ${state === "paused" || paused ? "Paused" : "Queued"}`;
}
