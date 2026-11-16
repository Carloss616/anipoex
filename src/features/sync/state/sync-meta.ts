import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersist } from "@/state/observable-persist";
import { settings$ } from "@/state/settings";
import type { Stamp } from "../utils/records";
import { watchTable } from "../utils/watch-table";
import { TABLES } from "./tables";

/**
 * Per synced table, when each record last changed. Kept apart from the
 * stores so none of them changes shape, and filled from the first launch so
 * edits made before connecting already carry their time.
 */
export const syncMeta$ = observable<Record<string, Record<string, Stamp>>>({});

syncObservable(syncMeta$, {
  persist: { name: "sync-meta", plugin: ObservablePersist },
});

for (const table of TABLES) watchTable(table, syncMeta$[table.name]);

// Names this device's files; not a secret, so Math.random is enough.
if (!settings$.device.id.peek()) {
  settings$.device.id.set(Math.random().toString(36).slice(2, 10));
}
