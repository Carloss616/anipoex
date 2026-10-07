import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersist } from "@/state/observable-persist";
import {
  DEFAULT_DENSITY,
  type Density,
  type TitlePosition,
} from "../utils/list-view";

/** How the manga grid looks. Read through `columnsFor` / `toTitlePosition`. */
export const listView$ = observable({
  density: DEFAULT_DENSITY as Density,
  title: "below" as TitlePosition,
});

syncObservable(listView$, {
  persist: { name: "manga-list-view", plugin: ObservablePersist },
});
