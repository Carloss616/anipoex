import { observable } from "@legendapp/state";
import type { Source } from "../utils/source";

export interface ContinueReading {
  mangaId: number;
  chapterId: string;
  number: number;
  title: string;
  /** False before the first chapter: the action reads "Start reading". */
  started: boolean;
  source?: Source;
}

/** Set while a detail with a next chapter is focused, for the iOS accessory. */
export const continueReading$ = observable<ContinueReading | null>(null);
