import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersist } from "@/state/observable-persist";
import type { TitlePosition } from "../components/manga-card";
import { DEFAULT_DENSITY, type Density } from "../utils/list-view";

/** How the manga grid looks. Density is read through `columnsFor`. */
export const listView$ = observable({
  density: DEFAULT_DENSITY as Density,
  title: "split" as TitlePosition,
});

syncObservable(listView$, {
  persist: { name: "manga-list-view", plugin: ObservablePersist },
});
