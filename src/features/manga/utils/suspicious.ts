import { FAR_BEHIND_GAP, type ProbeMap, SUSPICIOUS_FACTOR } from "./msu";
import { type Excluded, isLive } from "./source-exclusions";

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** Whether a match's latest chapter runs far ahead of the other live ones. */
export function isSuspicious(
  id: string,
  sources: { id: string }[],
  excluded: Excluded,
  probes: ProbeMap,
): boolean {
  const p = probes[id];
  if (!p?.matched) return false;
  const others = sources
    .filter(
      (s) => s.id !== id && !isLive(excluded[s.id]) && probes[s.id]?.matched,
    )
    .map((s) => probes[s.id].latest);
  return (
    others.length >= 2 &&
    p.latest - median(others) > SUSPICIOUS_FACTOR * FAR_BEHIND_GAP
  );
}
