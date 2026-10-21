import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersist } from "@/state/observable-persist";
import type { ExcludedMap, PinnedMap } from "../utils/msu";

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
