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

/** Set while a detail with a next chapter has focus, for the iOS tab bar accessory. */
export const continueReading$ = observable<ContinueReading | null>(null);
