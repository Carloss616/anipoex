import { observable } from "@legendapp/state";
import type { SourceMark } from "../utils/scan-activity/utils/marks";

/** What the web's floating view shows of a running scan. */
export interface ScanView {
  mangaId: number;
  name: string;
  status: string;
  /** 0 to 1, a Scan all's; null loops, for rescans. */
  progress: number | null;
  cover?: string;
  /** Every source the scans probe, found first. */
  marks: SourceMark[];
  /** A Reading scan's place in the list. */
  library?: {
    index: number;
    total: number;
    newSoFar: number;
    /** The manga still finishing behind this one. */
    finishing?: string;
  };
}

/**
 * Per manga with scans running, the view of all of them, and the Reading
 * scan's at `library`; not persisted.
 */
export const scanViews$ = observable<Record<string, ScanView>>({});

/** Each view's Stop: an observable would take a function for a computed. */
export const scanStops = new Map<string, () => void>();
