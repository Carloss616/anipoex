import { useValue } from "@legendapp/state/react";
import {
  syncing$,
  syncState$,
  type TargetKey,
} from "@/features/sync/state/engine";
import { unsyncedSummary } from "@/features/sync/state/unsynced";
import { network$ } from "@/state/network";
import { syncLine } from "../../../utils/sync-line";

/** A target's state line, and what this device changed since its last sync. */
export function useSyncItem(key: TargetKey) {
  const unsynced = useValue(() => unsyncedSummary(key));
  const line = useValue(() =>
    syncLine({
      syncing: !!syncing$[key].get(),
      online: network$.online.get(),
      synced: !!syncState$.targets[key].lastSync.get(),
      unsynced: unsyncedSummary(key),
    }),
  );

  return { line, unsynced };
}
