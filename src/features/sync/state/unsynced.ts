import { valueAt } from "../utils/records";
import { countUnsynced } from "../utils/unsynced";
import { plural, syncState$, type TargetKey } from "./engine";
import { syncMeta$ } from "./sync-meta";
import { TABLES } from "./tables";

const LABELS: Record<string, string> = {
  settings: "setting",
  matches: "source pick",
  "manual-matches": "manual match",
  exclusions: "exclusion",
  pins: "pin",
  probes: "source check",
  "search-history": "search history",
  extensions: "extension",
};

/**
 * What this device changed since the target's last sync, e.g. "2 pins · 1
 * setting". Empty when nothing waits, and also before the first sync: the
 * screen words that case itself.
 */
export function unsyncedSummary(key: TargetKey) {
  const since = syncState$.targets[key].lastSync.get();
  if (!since) return "";
  return TABLES.flatMap((table) => {
    const stamps = syncMeta$[table.name].get() ?? {};
    const n = countUnsynced(
      stamps,
      since,
      (record) => !!table.local?.(valueAt(table.obs$.get(), record)),
    );
    return n ? [plural(n, LABELS[table.name])] : [];
  }).join(" · ");
}
