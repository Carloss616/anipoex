import { compareSources, type PickPrefs } from "./compare-sources";
import type { ProbeMap } from "./msu";
import { type Excluded, isLive } from "./source-exclusions";
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
