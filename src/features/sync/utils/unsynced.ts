import { type Stamp, stampOf } from "./records";

/** The records changed after `since` that a sync would carry. */
export const countUnsynced = (
  stamps: Record<string, Stamp>,
  since: number,
  isLocal: (key: string) => boolean,
) =>
  Object.entries(stamps).filter(
    ([key, stamp]) => !stamp.local && stampOf(stamp) > since && !isLocal(key),
  ).length;
