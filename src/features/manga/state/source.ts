import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersist } from "@/state/observable-persist";

/** Which source each manga's chapter list reads, keyed by its AniList id. */
export const source$ = observable<Record<number, string | undefined>>({});

syncObservable(source$, {
  persist: { name: "manga-source", plugin: ObservablePersist },
});
