import type {
  ExcludedRecord,
  ExcludeReason,
  PinRecord,
  ProbeMap,
  TimestampMeta,
} from "./msu";
import { classify, isBadKind } from "./source-classify";

export type Excluded = Record<string, ExcludedRecord>;
export type Pinned = Record<string, PinRecord>;

const DAY_MS = 86_400_000;

export const isLive = (rec: TimestampMeta | undefined): boolean =>
  rec != null && rec.deletedAt == null;

const tombstone = <T extends TimestampMeta>(rec: T, now: number): T => ({
  ...rec,
  updatedAt: now,
  deletedAt: now,
});

const tombstoneLive = <T extends TimestampMeta>(
  map: Record<string, T>,
  now: number,
  skip: (id: string) => boolean = () => false,
): Record<string, T> => {
  const out = { ...map };
  for (const [id, rec] of Object.entries(map)) {
    if (isLive(rec) && !skip(id)) out[id] = tombstone(rec, now);
  }
  return out;
};

export function toggleExcluded(
  excluded: Excluded,
  pinned: Pinned,
  provider: string,
  exclude: boolean,
  reason: ExcludeReason,
  now: number,
): { excluded: Excluded; pinned: Pinned } {
  const next = { ...excluded };
  if (exclude) next[provider] = { reason, updatedAt: now };
  else if (excluded[provider])
    next[provider] = tombstone(excluded[provider], now);
  return {
    excluded: next,
    pinned: { ...pinned, [provider]: { updatedAt: now } },
  };
}

export const clearExclusions = (
  excluded: Excluded,
  pinned: Pinned,
  now: number,
) => ({
  excluded: tombstoneLive(excluded, now),
  pinned: tombstoneLive(pinned, now),
});

export const clearAutoExclusions = (
  excluded: Excluded,
  pinned: Pinned,
  now: number,
): Excluded => tombstoneLive(excluded, now, (id) => isLive(pinned[id]));

export function autoExclude(
  excluded: Excluded,
  pinned: Pinned,
  probes: ProbeMap,
  prev: ProbeMap,
  read: number,
  gap: number,
  keep: string | undefined,
): Excluded {
  const next = { ...excluded };
  for (const [id, p] of Object.entries(probes)) {
    if (id === keep || isLive(pinned[id]) || isLive(excluded[id])) continue;
    const kind = classify(read, p.latest, p.count, p.errored, gap);
    if (!isBadKind(kind)) continue;
    // one error is not enough: the previous scan must have failed too
    if (kind === "error-found" && !prev[id]?.errored) continue;
    next[id] = { reason: kind, updatedAt: p.updatedAt };
  }
  return next;
}

export const expiredAutoExclusions = (
  excluded: Excluded,
  pinned: Pinned,
  now: number,
  days: number,
): string[] =>
  Object.entries(excluded)
    .filter(
      ([id, rec]) =>
        isLive(rec) &&
        !isLive(pinned[id]) &&
        now - rec.updatedAt >= days * DAY_MS,
    )
    .map(([id]) => id)
    .sort();

export function recheckExclusions(
  excluded: Excluded,
  probes: ProbeMap,
  providers: string[],
  read: number,
  gap: number,
  now: number,
): Excluded {
  const next = { ...excluded };
  for (const id of providers) {
    const p = probes[id];
    if (!p) continue;
    const kind = classify(read, p.latest, p.count, p.errored, gap);
    if (isBadKind(kind)) next[id] = { reason: kind, updatedAt: p.updatedAt };
    else if (excluded[id]) next[id] = tombstone(excluded[id], now);
  }
  return next;
}
