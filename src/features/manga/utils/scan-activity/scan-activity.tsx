import { toast } from "@/components/ui/toast";
import { desktop } from "@/utils/desktop";
import { scanViews$ } from "../../state/scan-views";
import { scanStatus } from "./utils";

export interface ScanActivityArgs {
  mangaId: number;
  name: string;
  total: number;
  /** A rescan of this one source: nothing to count, so its progress loops. */
  source?: { id: string; name: string };
}

/** A scan shown outside the sheet while it runs: in the OS where it can, else in the app. */
export interface ScanActivity {
  progress(done: number): void;
  /** `found`: the sources that have the manga. */
  end(found: number): void;
}

const canNotify = () => typeof Notification !== "undefined";

/**
 * A floating view over every screen shows the scan. Desktop also shows a Scan
 * all on the Dock icon, and its result as a notification when the app is out
 * of sight.
 */
export function startScanActivity({
  mangaId,
  name,
  total,
  source,
}: ScanActivityArgs): ScanActivity {
  const view$ = scanViews$[source ? `${mangaId}-${source.id}` : mangaId];
  const show = (done: number) =>
    view$.set({
      mangaId,
      name,
      status: scanStatus({ done, total, found: null, source: source?.name }),
      progress: source ? null : done / total,
    });
  show(0);
  // A rescan is short: the view is enough.
  if (source) return { progress: show, end: () => view$.delete() };
  // Asked on the click that starts the scan: browsers drop a prompt without one.
  if (canNotify() && Notification.permission === "default")
    void Notification.requestPermission();
  desktop?.scanProgress(0);

  return {
    progress: (done) => {
      show(done);
      desktop?.scanProgress(done / total);
    },
    end: (found) => {
      view$.delete();
      desktop?.scanProgress(-1);
      const body = scanStatus({ done: total, total, found });
      if (document.hasFocus() || !canNotify()) {
        toast.success(`${name}: ${body}`);
        return;
      }
      if (Notification.permission !== "granted") return;
      const notification = new Notification(`Scanned ${name}`, { body });
      notification.onclick = () => window.focus();
    },
  };
}
