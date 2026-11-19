import type { ActivitySection } from "@/features/activity/utils/filters";
import { clearQueue, retryAllSkipped } from "./actions";
import { type DownloadsState, toHeaderActions } from "./section-header";

/** Each section header's buttons. */
export const headerActions = (section: ActivitySection, d: DownloadsState) =>
  toHeaderActions(section, d, { clearQueue, retryAllSkipped });

// Only the Downloads header has buttons that depend on the downloads.
export const NO_DOWNLOADS: DownloadsState = {
  paused: false,
  pending: false,
  failed: false,
};
