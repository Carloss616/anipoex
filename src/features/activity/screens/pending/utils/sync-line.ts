interface SyncLineInput {
  syncing: boolean;
  online: boolean;
  synced: boolean;
  /** What this device changed since the last sync; empty when nothing. */
  unsynced: string;
}

/** The target's state in a few words; empty while a sync is about to start. */
export function syncLine({ syncing, online, synced, unsynced }: SyncLineInput) {
  if (syncing) return "Syncing…";
  if (!synced) return "Not synced yet";
  if (!unsynced) return "Up to date";
  return online ? "" : "Waiting for connection";
}
