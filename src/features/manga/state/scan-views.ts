import { observable } from "@legendapp/state";

/** What the web's floating view shows of a running scan. */
export interface ScanView {
  mangaId: number;
  name: string;
  status: string;
  /** 0 to 1; null loops, for a rescan. */
  progress: number | null;
}

/** Per running scan (a manga's Scan all, or one source's rescan), its view; not persisted. */
export const scanViews$ = observable<Record<string, ScanView>>({});

/** The manga whose source sheet is open: its scans' views hide under it. */
export const openSheet$ = observable<number | null>(null);

/** A tap on a view asks that manga's focused detail screen to open its sheet. */
export const sheetRequest$ = observable<number | null>(null);
