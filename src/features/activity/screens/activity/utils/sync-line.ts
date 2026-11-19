interface SyncLineInput {
  syncing: boolean;
  online: boolean;
  synced: boolean;
  /** Seconds until the next sync, when one is set to run. */
  inSeconds?: number;
}

/**
 * The state of a target with changes to send, in a few words; empty while a
 * sync is about to start.
 */
export function syncLine({
  syncing,
  online,
  synced,
  inSeconds,
}: SyncLineInput) {
  if (syncing) return "Syncing…";
  if (!synced) return "Not synced yet";
  if (!online) return "Waiting for connection";
  return inSeconds === undefined ? "" : `Syncs in ${inSeconds}s`;
}
