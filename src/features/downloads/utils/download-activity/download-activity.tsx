import { scanViews$ } from "@/features/manga/state/scan-views";
import { desktop } from "@/utils/desktop";
import { endStatus } from "../activity-view";

/** The downloads outside the app, while any chapter runs or waits. */
export interface DownloadActivity {
  update(now: {
    title: string;
    done: number;
    total: number;
    fraction: number;
  }): void;
  /** `paused`: the queue was paused with chapters left, not finished. */
  end(summary: { done: number; failed: number; paused: boolean }): void;
}

// A Scan all or the Reading scan shows on the Dock first; a rescan never does.
const scanOwnsDock = () =>
  Object.values(scanViews$.peek()).some(
    (v) => v.library || v.progress !== null,
  );

/**
 * Desktop shows the downloads on the Dock icon, and their end as a
 * notification when the app is out of sight; a plain browser has none.
 */
export function startDownloadActivity(_onPause: () => void): DownloadActivity {
  const bridge = desktop;
  if (!bridge) return { update: () => {}, end: () => {} };
  return {
    update: ({ done, total, fraction }) => {
      if (!scanOwnsDock()) bridge.scanProgress((done + fraction) / total);
    },
    end: (summary) => {
      if (!scanOwnsDock()) bridge.scanProgress(-1);
      if (
        summary.paused ||
        document.hasFocus() ||
        typeof Notification === "undefined" ||
        Notification.permission !== "granted"
      )
        return;
      const notification = new Notification("Downloads", {
        body: endStatus(summary),
      });
      notification.onclick = () => window.focus();
    },
  };
}
