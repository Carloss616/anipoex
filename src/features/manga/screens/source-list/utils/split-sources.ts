import {
  compareSources,
  type PickPrefs,
} from "@/features/manga/utils/compare-sources";
import type {
  ExcludeReason,
  ProbeMap,
  ProviderProbe,
} from "@/features/manga/utils/msu";
import type { Source } from "@/features/manga/utils/source";
import {
  type Excluded,
  isLive,
  type Pinned,
} from "@/features/manga/utils/source-exclusions";
import { isSuspicious } from "@/features/manga/utils/suspicious";

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

// Excluded rows by reason: behind ones still have a match, unmatched ones are
// what a title search fixes, failures are the source's own trouble.
const REASON_ORDER: Record<ExcludeReason, number> = {
  outdated: 0,
  "not-matched": 1,
  "error-found": 2,
  "bad-numbering": 3,
  other: 3,
};

/**
 * Installed sources split into available (best first, as the auto-pick ranks
 * them) and excluded (by reason, then name),
 * both filtered by the query.
 */
export function splitSources(
  sources: Source[],
  excluded: Excluded,
  pinned: Pinned,
  probes: ProbeMap,
  query: string,
  prefs: PickPrefs,
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
        rank(a) - rank(b) || compareSources(a.source, b.source, probes, prefs),
    );

  const out = sources
    .filter((s) => isLive(excluded[s.id]) && shown(s))
    .map((source) => ({
      source,
      reason: excluded[source.id].reason,
      pinned: isLive(pinned[source.id]),
    }))
    .sort(
      (a, b) =>
        REASON_ORDER[a.reason] - REASON_ORDER[b.reason] ||
        a.source.name.localeCompare(b.source.name),
    );

  return { available, excluded: out };
}

/**
 * Rows named in `order` come first, in that order; the rest keep their place
 * after them.
 */
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

/**
 * A source's place while searching by title: with results, searching, empty
 * or failed, not searched.
 */
export const titleGroup = (
  rail: { status: "loading" | "done" | "error"; mangas: unknown[] } | undefined,
) =>
  !rail ? 3 : rail.status === "loading" ? 1 : rail.mangas.length > 0 ? 0 : 2;

/** Rows by title search group, each group in the order given. */
export const byTitleResults = <T extends { source: Source }>(
  rows: T[],
  groupOf: (sourceId: string) => number,
): T[] =>
  rows
    .map((row, i) => ({ row, i, group: groupOf(row.source.id) }))
    .sort((a, b) => a.group - b.group || a.i - b.i)
    .map(({ row }) => row);
