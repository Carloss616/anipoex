import { downloadActions, type HeaderAction } from "./download-actions";
import type { ActivitySection } from "./filters";

export interface DownloadsState {
  paused: boolean;
  pending: boolean;
  failed: boolean;
}

// Passed in: their module reaches react-native, which bun can't load.
export interface ScanActions {
  clearQueue: () => void;
  retryAllSkipped: () => void;
}

export function sectionTitle(section: ActivitySection, count: number): string {
  switch (section) {
    case "running":
      return `Running · ${count}`;
    case "queue":
      return `Up next · ${count}`;
    case "downloads":
      return `Downloads · ${count}`;
    case "skipped":
      return "Skipped as slow";
    case "entries":
      return `To send · ${count}`;
    case "unsent":
      return "Not sent";
    case "sync":
      return "Sync";
  }
}

export const SECTION_DESCRIPTIONS: Partial<Record<ActivitySection, string>> = {
  queue: "Each starts when the one before has 2 sources left",
  skipped: "Left out of the rest of this scan",
};

export function toHeaderActions(
  section: ActivitySection,
  d: DownloadsState,
  scan: ScanActions,
): HeaderAction[] {
  switch (section) {
    case "queue":
      return [{ label: "Clear", onPress: scan.clearQueue }];
    case "downloads":
      return downloadActions(d.paused, d.pending, d.failed);
    case "skipped":
      return [{ label: "Retry all", onPress: scan.retryAllSkipped }];
    default:
      return [];
  }
}
