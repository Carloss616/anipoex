import { observable } from "@legendapp/state";

/** What the web's floating view shows of a running scan. */
export interface ScanView {
  mangaId: number;
  name: string;
  status: string;
  /** 0 to 1, a Scan all's; null loops, for rescans. */
  progress: number | null;
}

/** Per manga with scans running, the view of all of them; not persisted. */
export const scanViews$ = observable<Record<string, ScanView>>({});
