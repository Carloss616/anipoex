import { observable, syncState } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersist } from "@/state/observable-persist";
import {
  LEGACY_TABLES,
  migrateLegacy,
  normalizeSettings,
  SETTINGS_VERSION,
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

if (settings$.version.peek() === 0) {
  // Both persist plugins load a table synchronously, so `peek` reads it.
  const legacy = Object.fromEntries(
    LEGACY_TABLES.map((name) => {
      const table$ = observable<unknown>(undefined);
      syncObservable(table$, {
        persist: { name, plugin: ObservablePersist },
      });
      return [name, table$];
    }),
  );
  settings$.set(
    normalizeSettings({
      ...settings$.peek(),
      ...migrateLegacy((name) => legacy[name].peek()),
      version: SETTINGS_VERSION,
    }),
  );
  for (const table$ of Object.values(legacy))
    void syncState(table$).resetPersistence();
}
