import { valueAt } from "../utils/records";
import { countUnsynced, formatUnsynced } from "../utils/unsynced";
import { syncState$, type TargetKey } from "./engine";
import { syncMeta$ } from "./sync-meta";
import { TABLES } from "./tables";

/**
 * What this device changed since the target's last sync, e.g. "2 pins · 1
 * setting". Empty when nothing waits, and also before the first sync: the
 * screen words that case itself.
 */
export function unsyncedSummary(key: TargetKey) {
  const since = syncState$.targets[key].lastSync.get();
  if (!since) return "";
  const counts: Record<string, number> = {};
  for (const table of TABLES) {
    // peek: a record's locality changes with its stamp, which is read below
    const value = table.local ? table.obs$.peek() : undefined;
    counts[table.name] = countUnsynced(
      syncMeta$[table.name].get() ?? {},
      since,
      (record) => !!table.local?.(valueAt(value, record)),
    );
  }
  return formatUnsynced(counts);
}
