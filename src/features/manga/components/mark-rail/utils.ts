import type { ActiveMark } from "@/features/manga/state/active-scans";

/** Left out of the scan or not found: drawn faded. */
export const DIM = new Set<ActiveMark["state"]>([
  "pending",
  "nomatch",
  "skipped",
  "stopped",
]);

/** Tiles a phone row fits beside the cover; the rest is a count. */
export const SHOWN = 5;

export const markLabel = ({ name, state }: ActiveMark) =>
  `${name}, ${state === "nomatch" ? "no match" : state}`;
