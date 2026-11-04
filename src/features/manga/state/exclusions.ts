import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersist } from "@/state/observable-persist";
import {
  type ExcludedMap,
  type ExcludeReason,
  mediaKey,
  type PinnedMap,
} from "../utils/msu";
import { toggleExcluded } from "../utils/source-exclusions";

/** Per manga, the sources dropped from its list: the same layout as MSU's `exclusions` map (gist file `seanime-msu-exclusions.json`). */
export const exclusions$ = observable<ExcludedMap>({});

/** Per manga, the sources whose exclusion the user decided by hand: MSU's `pins` map (gist file `seanime-msu-pins.json`). */
export const pins$ = observable<PinnedMap>({});

syncObservable(exclusions$, {
  persist: { name: "source-exclusions", plugin: ObservablePersist },
});
syncObservable(pins$, {
  persist: { name: "source-pins", plugin: ObservablePersist },
});

/** Excludes or includes a source of the manga by hand, which pins it so a scan never undoes it. */
export function decideByHand(
  mangaId: number,
  sourceId: string,
  exclude: boolean,
  reason: ExcludeReason,
) {
  const key = mediaKey(mangaId);
  const next = toggleExcluded(
    exclusions$[key].peek() ?? {},
    pins$[key].peek() ?? {},
    sourceId,
    exclude,
    reason,
    Date.now(),
  );
  exclusions$[key].set(next.excluded);
  pins$[key].set(next.pinned);
}
