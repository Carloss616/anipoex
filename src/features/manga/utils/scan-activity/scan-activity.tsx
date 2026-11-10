import { toast } from "@/components/ui/toast";
import { desktop } from "@/utils/desktop";
import { scanStops, scanViews$ } from "../../state/scan-views";
import { type LibraryActivity, libraryStatus } from "../library-run";
import { marksById, orderMarks, type SourceMark, setMark } from "./utils/marks";
import {
  counted,
  groupStatus,
  isRunning,
  joinGroup,
  type Scan,
  scanStatus,
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

/**
 * Asks for notifications once; call it on the scan's starting click, since
 * browsers drop a prompt without one.
 * @platform web
 */
export function askToNotify() {
  if (canNotify() && Notification.permission === "default")
    void Notification.requestPermission();
}

const notify = (title: string, body: string) => {
  if (Notification.permission !== "granted") return;
  const notification = new Notification(title, { body });
  notification.onclick = () => window.focus();
};

const groups = new Map<
  number,
  { scans: Scan[]; marks: Record<string, SourceMark> }
>();

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
  cover,
  sources,
  onStop,
}: ScanActivityArgs): ScanActivity {
  const scan: Scan = { done: 0, total, found: null, source: source?.name };
  const { group } = joinGroup(groups, mangaId, scan, () => ({
    scans: [],
    marks: {},
  }));
  Object.assign(group.marks, marksById(sources));
  if (onStop) scanStops.set(String(mangaId), onStop);
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
        cover,
        marks: orderMarks(Object.values(group.marks)),
      });
    view$.delete();
    scanStops.delete(String(mangaId));
    // A rescan is short: the view is enough.
    if (scans.every((s) => s.source)) return;
    const body = groupStatus(scans);
    if (document.hasFocus() || !canNotify()) {
      toast.success(`${name}: ${body}`);
      return;
    }
    notify(`Scanned ${name}`, body);
  };
  if (!source) askToNotify();
  show();

  return {
    ...trackScan(scan, show),
    mark: (id, mark) => {
      setMark(group.marks, id, mark);
      show();
    },
  };
}

/**
 * The Reading scan in one view at `library`, replaced for each manga; the
 * list's summary toast is the caller's, so only a notification ends it here.
 */
export function startLibraryActivity({
  total,
  onStop,
}: LibraryActivityArgs): LibraryActivity {
  const view$ = scanViews$.library;
  scanStops.set("library", onStop);
  return {
    manga: ({ entry, index, newSoFar }) => {
      const library = { index, total, newSoFar };
      desktop?.scanProgress((index - 1) / total);
      // Shown before its scan starts: a manga read recently never starts one.
      view$.set({
        mangaId: entry.mangaId,
        name: entry.name,
        status: "Checking sources",
        progress: null,
        cover: entry.cover,
        marks: [],
        library,
      });
      return ({ mangaId, name, total: sources, cover, ...args }) => {
        const scan: Scan = { done: 0, total: sources, found: null };
        const marks = marksById(args.sources);
        const show = () =>
          view$.set({
            mangaId,
            name,
            status: scanStatus(scan),
            progress: scan.done / scan.total,
            cover,
            marks: orderMarks(Object.values(marks)),
            library,
          });
        show();
        return {
          ...trackScan(scan, show),
          mark: (id, mark) => {
            setMark(marks, id, mark);
            show();
          },
        };
      };
    },
    end: (summary) => {
      view$.delete();
      scanStops.delete("library");
      desktop?.scanProgress(-1);
      if (!document.hasFocus() && canNotify())
        notify("Scanned Reading", libraryStatus(summary));
    },
  };
}
