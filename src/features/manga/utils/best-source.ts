import { compareSources, type PickPrefs } from "./compare-sources";
import type { ProbeMap } from "./msu";
import { type Excluded, isLive } from "./source-exclusions";
import type { SourceMatch } from "./source-match";
import { isSuspicious } from "./suspicious";

type PickSource = { id: string; name: string; lang?: string };

/**
 * The sources a manga can be read from: matched, not excluded, not failing,
 * numbering not suspicious.
 */
export function readableSources<S extends PickSource>(
  sources: S[],
  excluded: Excluded,
  probes: ProbeMap,
): S[] {
  return sources.filter((s) => {
    const probe = probes[s.id];
    return (
      probe?.matched &&
      !probe.errored &&
      !isLive(excluded[s.id]) &&
      !isSuspicious(s.id, sources, excluded, probes)
    );
  });
}

/**
 * The source to read a manga from when none is chosen: the first readable one
 * by `compareSources`.
 */
export function bestSource(
  sources: PickSource[],
  excluded: Excluded,
  probes: ProbeMap,
  prefs: PickPrefs,
): string | undefined {
  return readableSources(sources, excluded, probes).sort((a, b) =>
    compareSources(a, b, probes, prefs),
  )[0]?.id;
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
