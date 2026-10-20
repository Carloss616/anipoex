import type { SemanticColor } from "@/components/ui/colors";
import type { ProviderProbe } from "@/features/manga/utils/msu";
import {
  classify,
  unreadChapters,
} from "@/features/manga/utils/source-classify";

export type SourceStatus = {
  label: string;
  color: SemanticColor;
  chapter?: number;
  suspicious?: boolean;
  age?: string;
};

const ageOf = (ms: number) => {
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`;
};

/** What a source row says about its probe: derived on render, so a read chapter changes it without a rescan. */
export function sourceStatus(
  probe: ProviderProbe | undefined,
  read: number,
  gap: number,
  suspicious: boolean,
  now: number,
): SourceStatus {
  if (!probe) return { label: "not scanned", color: "secondary" };
  const age = ageOf(now - probe.updatedAt);
  if (!probe.matched)
    return probe.errored
      ? { label: "error", color: "destructive", age }
      : { label: "no match", color: "warning", age };
  const unread = unreadChapters(read, probe.latest);
  const outdated =
    classify(read, probe.latest, probe.count, probe.errored, gap) ===
    "outdated";
  return {
    label: `+${unread}`,
    color:
      suspicious || outdated ? "warning" : unread > 0 ? "success" : "secondary",
    chapter: probe.latest,
    suspicious,
    age,
  };
}
