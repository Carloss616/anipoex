import type { ProviderProbe } from "@/features/manga/utils/msu";
import {
  type ExcludeReason,
  FAR_BEHIND_GAP,
  type ProbeMap,
  SUSPICIOUS_FACTOR,
} from "@/features/manga/utils/msu";
import type { Source } from "@/features/manga/utils/source";
import {
  type Excluded,
  isLive,
  type Pinned,
} from "@/features/manga/utils/source-exclusions";

export type SourceRow = {
  source: Source;
  probe?: ProviderProbe;
  suspicious: boolean;
};
export type ExcludedRow = {
  source: Source;
  reason: ExcludeReason;
  pinned: boolean;
};

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** Whether a matched source's latest chapter runs far ahead of the other live matches. */
export function isSuspicious(
  id: string,
  sources: Source[],
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

/** Installed sources split into available (best first) and excluded (by name), both filtered by the query. */
export function splitSources(
  sources: Source[],
  excluded: Excluded,
  pinned: Pinned,
  probes: ProbeMap,
  query: string,
): { available: SourceRow[]; excluded: ExcludedRow[] } {
  const needle = query.trim().toLowerCase();
  const shown = (s: Source) => s.name.toLowerCase().includes(needle);
  const live = sources.filter((s) => !isLive(excluded[s.id]));

  const rank = (r: SourceRow) => (r.suspicious ? 1 : r.probe?.matched ? 0 : 2);
  const available = live
    .map((source) => ({
      source,
      probe: probes[source.id],
      suspicious: isSuspicious(source.id, sources, excluded, probes),
    }))
    .filter((r) => shown(r.source))
    .sort(
      (a, b) =>
        rank(a) - rank(b) ||
        (b.probe?.latest ?? -1) - (a.probe?.latest ?? -1) ||
        a.source.name.localeCompare(b.source.name),
    );

  const out = sources
    .filter((s) => isLive(excluded[s.id]) && shown(s))
    .map((source) => ({
      source,
      reason: excluded[source.id].reason,
      pinned: isLive(pinned[source.id]),
    }))
    .sort((a, b) => a.source.name.localeCompare(b.source.name));

  return { available, excluded: out };
}

/** Rows named in `order` come first, in that order; the rest keep their place after them. */
export function applyOrder<T extends { source: Source }>(
  rows: T[],
  order: readonly string[],
): T[] {
  const rank = new Map(order.map((id, i) => [id, i]));
  const known = rows
    .filter((r) => rank.has(r.source.id))
    .sort(
      (a, b) => (rank.get(a.source.id) ?? 0) - (rank.get(b.source.id) ?? 0),
    );
  return [...known, ...rows.filter((r) => !rank.has(r.source.id))];
}
