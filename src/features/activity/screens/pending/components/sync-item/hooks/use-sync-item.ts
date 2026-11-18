import { useValue } from "@legendapp/state/react";
import { useEffect, useState } from "react";
import {
  nextSync$,
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
  const next = useValue(nextSync$);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (next == null) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [next]);
  const inSeconds =
    next == null ? undefined : Math.max(1, Math.ceil((next - now) / 1000));
  const line = useValue(() =>
    syncLine({
      syncing: !!syncing$[key].get(),
      // Only the gist needs the network; a folder syncs offline too
      online: key !== "gist" || network$.online.get(),
      synced: !!syncState$.targets[key].lastSync.get(),
      inSeconds,
    }),
  );

  return { line, unsynced };
}
