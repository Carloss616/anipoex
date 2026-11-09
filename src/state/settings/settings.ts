import { observable, syncState } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersist } from "@/state/observable-persist";
import {
  moveLegacyIn,
  normalizeSettings,
  type Settings,
} from "./utils/migrate";

/** Every setting in one table, so a sync can carry it as one object. */
export const settings$ = observable<Settings>(normalizeSettings(undefined));

syncObservable(settings$, {
  persist: {
    name: "settings",
    plugin: ObservablePersist,
    transform: { load: normalizeSettings },
  },
});

// Both persist plugins load a table synchronously, so `peek` reads it.
moveLegacyIn(settings$, (name) => {
  const table$ = observable<unknown>(undefined);
  syncObservable(table$, { persist: { name, plugin: ObservablePersist } });
  return {
    value: table$.peek(),
    delete: () => void syncState(table$).resetPersistence(),
  };
});
