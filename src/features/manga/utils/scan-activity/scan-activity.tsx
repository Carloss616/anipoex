import { toast } from "@/components/ui/toast";
import { desktop } from "@/utils/desktop";
import { scanViews$ } from "../../state/scan-views";
import type { LibraryActivity } from "../library-run";
import type { SourceMark } from "./utils/marks";
import {
  counted,
  groupStatus,
  isRunning,
  joinGroup,
  type Scan,
  trackScan,
} from "./utils/status";

export interface ScanActivityArgs {
  mangaId: number;
  name: string;
  total: number;
  /** A rescan of this one source: nothing to count, so its progress loops. */
  source?: { id: string; name: string };
  cover?: string;
  /** The sources the scan probes, all pending. */
  sources: SourceMark[];
  onStop?: () => void;
}

/** The scan outside the sheet: in the OS where it can, else in the app. */
export interface ScanActivity {
  progress(done: number): void;
  mark(id: string, mark: Pick<SourceMark, "state" | "unread">): void;
  /** `found`: the sources that have the manga. */
  end(found: number): void;
}

export interface LibraryActivityArgs {
  total: number;
  onStop: () => void;
}

const canNotify = () => typeof Notification !== "undefined";

const groups = new Map<number, { scans: Scan[] }>();

/**
 * A floating view over every screen, one per manga for all its scans that run
 * together; desktop also shows a Scan all on the Dock icon, and the result of
 * one as a notification when the app is out of sight.
 */
export function startScanActivity({
  mangaId,
  name,
  total,
  source,
}: ScanActivityArgs): ScanActivity {
  const scan: Scan = { done: 0, total, found: null, source: source?.name };
  const { group } = joinGroup(groups, mangaId, scan, () => ({ scans: [] }));
  const view$ = scanViews$[mangaId];
  const show = () => {
    const { scans } = group;
    const all = counted(scans);
    // Only a Scan all owns the Dock bar: another manga's may be on it.
    if (scans.some((s) => !s.source))
      desktop?.scanProgress(all ? all.done / all.total : -1);
    if (isRunning(scans))
      return view$.set({
        mangaId,
        name,
        status: groupStatus(scans),
        progress: all ? all.done / all.total : null,
      });
    view$.delete();
    // A rescan is short: the view is enough.
    if (scans.every((s) => s.source)) return;
    const body = groupStatus(scans);
    if (document.hasFocus() || !canNotify()) {
      toast.success(`${name}: ${body}`);
      return;
    }
    if (Notification.permission !== "granted") return;
    const notification = new Notification(`Scanned ${name}`, { body });
    notification.onclick = () => window.focus();
  };
  // Asked on the scan's starting click: browsers drop a prompt without one.
  if (!source && canNotify() && Notification.permission === "default")
    void Notification.requestPermission();
  show();

  return { ...trackScan(scan, show), mark: () => {} };
}

// shortcut: reports nothing, until the Reading scan gets its own view.
export function startLibraryActivity(
  _args: LibraryActivityArgs,
): LibraryActivity {
  const none = () => {};
  return {
    manga: () => () => ({ progress: none, mark: none, end: none }),
    end: none,
  };
}
