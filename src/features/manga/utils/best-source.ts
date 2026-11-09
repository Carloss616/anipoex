import { compareSources, type PickPrefs } from "./compare-sources";
import type { ProbeMap } from "./msu";
import { type Excluded, isLive } from "./source-exclusions";
import type { SourceMatch } from "./source-match";
import { isSuspicious } from "./suspicious";

/**
 * The source to read a manga from when none is chosen: matched, not excluded,
 * not failing, numbering not suspicious, first by `compareSources`.
 */
export function bestSource(
  sources: { id: string; name: string; lang?: string }[],
  excluded: Excluded,
  probes: ProbeMap,
  prefs: PickPrefs,
): string | undefined {
  return sources
    .filter((s) => {
      const probe = probes[s.id];
      return (
        probe?.matched &&
        !probe.errored &&
        !isLive(excluded[s.id]) &&
        !isSuspicious(s.id, sources, excluded, probes)
      );
    })
    .sort((a, b) => compareSources(a, b, probes, prefs))[0]?.id;
}

/**
 * What a scan should pick: `best` when nothing is chosen or a scan chose
 * another; never over a pick made by hand.
 */
export function nextAutoPick(
  match: SourceMatch | undefined,
  best: string | undefined,
  autoPick: boolean,
): string | undefined {
  if (!autoPick || !best) return undefined;
  if (!match) return best;
  return match.auto && match.sourceId !== best ? best : undefined;
}
