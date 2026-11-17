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

/** Singular and plural; null for a table that is one record, said unnumbered. */
const LABELS: Record<string, [string, string | null]> = {
  settings: ["setting", "settings"],
  matches: ["source pick", "source picks"],
  "manual-matches": ["manual match", "manual matches"],
  exclusions: ["exclusion", "exclusions"],
  pins: ["pin", "pins"],
  probes: ["source check", "source checks"],
  "search-history": ["search history", null],
  extensions: ["extension", "extensions"],
};

/** "1 setting · 3 source picks" from the counts by table; "" for none. */
export const formatUnsynced = (counts: Record<string, number>) =>
  Object.entries(LABELS)
    .filter(([table]) => counts[table])
    .map(([table, [one, many]]) =>
      many === null
        ? one
        : `${counts[table]} ${counts[table] === 1 ? one : many}`,
    )
    .join(" · ");
