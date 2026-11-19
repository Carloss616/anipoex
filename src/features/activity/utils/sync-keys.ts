import {
  syncing$,
  syncState$,
  type TargetKey,
} from "@/features/sync/state/engine";
import { unsyncedSummary } from "@/features/sync/state/unsynced";

const targets = () => Object.keys(syncState$.targets.get(true)) as TargetKey[];

const waits = (key: TargetKey) =>
  !!syncing$[key].get() || unsyncedSummary(key) !== "";

/** The sync targets with something to send or a sync running, joined. */
export const syncKeys = () => targets().filter(waits).join();
