import type { SemanticColor } from "@/components/ui/colors";

// Mirrors manga-source-updates utils/types.ts (and REASONS/config) for gist sync; must not drift.

export type AutoBadKind = "not-matched" | "error-found" | "outdated";
export type ResultKind = AutoBadKind | "new" | "up-to-date" | "all-excluded";
export type ExcludeReason = AutoBadKind | "bad-numbering" | "other";

export interface TimestampMeta {
  updatedAt: number;
  deletedAt?: number;
}

export interface ExcludedRecord extends TimestampMeta {
  reason: ExcludeReason;
}

export type PinRecord = TimestampMeta;

export interface ProviderProbe extends TimestampMeta {
  provider: string;
  providerName: string;
  latest: number;
  count: number;
  matched: boolean;
  errored: boolean;
  /** anipoex-only, not in MSU: what the failed read said. */
  error?: string;
}

export type ProbeMap = Record<string, ProviderProbe>;
export type ExcludedMap = Record<string, Record<string, ExcludedRecord>>;
export type PinnedMap = Record<string, Record<string, PinRecord>>;

export const REASONS: Record<
  ExcludeReason,
  { menu: string; badge: string; color: SemanticColor }
> = {
  outdated: { menu: "Behind / outdated", badge: "behind", color: "warning" },
  "bad-numbering": {
    menu: "Wrong chapter numbers",
    badge: "bad numbers",
    color: "warning",
  },
  "not-matched": { menu: "No match", badge: "no match", color: "warning" },
  "error-found": { menu: "Fetch error", badge: "error", color: "destructive" },
  other: { menu: "Other", badge: "manual", color: "secondary" },
};

export const FAR_BEHIND_GAP = 10;
export const PARALLEL_BATCH = 10;

// anipoex-only, not in MSU
export const AUTO_RECHECK_DAYS = 7;
export const SUSPICIOUS_FACTOR = 2;

export const mediaKey = (mediaId: number) => String(mediaId);
