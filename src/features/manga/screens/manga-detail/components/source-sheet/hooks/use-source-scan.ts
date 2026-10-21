import { useValue } from "@legendapp/state/react";
import { exclusions$ } from "@/features/manga/state/exclusions";
import { probes$, scanning$ } from "@/features/manga/state/probes";
import type { Source } from "@/features/manga/utils/source";
import { isSuspicious } from "../utils/split-sources";

/** One source's probe, read in its own row: a landing re-renders only that row. */
export function useSourceScan(key: string, id: string, sources: Source[]) {
  return {
    probe: useValue(probes$[key][id]),
    scanning: useValue(() => scanning$[key][id].get() === true),
    // Re-run on every landing; the row re-renders only when the flag flips.
    suspicious: useValue(() =>
      isSuspicious(
        id,
        sources,
        exclusions$[key].get() ?? {},
        probes$[key].get() ?? {},
      ),
    ),
  };
}
