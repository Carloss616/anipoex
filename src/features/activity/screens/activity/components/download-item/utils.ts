import type { QueuedDownload } from "@/features/downloads";

export const downloadTitle = (
  manga: string,
  { number, name }: Pick<QueuedDownload["chapter"], "number" | "name">,
) => `${manga} · ${number >= 0 ? `Chapter ${number}` : name || "Chapter"}`;

/** Under the title when it isn't running: the source and its state. */
export function downloadLine(
  source: string,
  state: QueuedDownload["state"],
  error: string | undefined,
  paused: boolean,
) {
  if (state === "failed") return `${source} · ${error || "Failed"}`;
  return `${source} · ${paused ? "Paused" : "Queued"}`;
}
