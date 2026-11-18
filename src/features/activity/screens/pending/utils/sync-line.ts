interface SyncLineInput {
  syncing: boolean;
  online: boolean;
  synced: boolean;
}

/**
 * The state of a target with changes to send, in a few words; empty while a
 * sync is about to start.
 */
export function syncLine({ syncing, online, synced }: SyncLineInput) {
  if (syncing) return "Syncing…";
  if (!synced) return "Not synced yet";
  return online ? "" : "Waiting for connection";
}
