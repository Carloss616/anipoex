import type { QueuedDownload } from "@/features/downloads";

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
