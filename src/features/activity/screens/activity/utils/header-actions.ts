import { clearQueue, retryAllSkipped } from "./actions";
import type { ActivitySection } from "./filters";
import { type DownloadsState, toHeaderActions } from "./section-header";

/** Each section header's buttons. */
export const headerActions = (section: ActivitySection, d: DownloadsState) =>
  toHeaderActions(section, d, { clearQueue, retryAllSkipped });
