import type { Observable, ObservableParam } from "@legendapp/state";
import { changedKeys, type Stamp, valueAt } from "./records";

/** A store that syncs, and what one of its records is. */
export interface SyncTable {
  /** Its name in file names: `anipoex-<name>.<device>.json`. */
  name: string;
  obs$: ObservableParam;
  /** How many levels down a record sits: 1 for per-manga, 2 per manga and source. */
  depth: number;
  /** Whether a record's key syncs; settings keeps some sections to the device. */
  synced?: (key: string) => boolean;
  /** Reads a value pulled from another build into this build's shape. */
  normalize?: (value: unknown) => unknown;
  /**
   * A record this device keeps to itself, as what only it found (a source
   * that fails here): never published, and ignored in other devices' files.
   */
  local?: (value: unknown) => boolean;
  /** Whether another device's record replaces a local one, however old. */
  localYields?: boolean;
}

/**
 * Set while a sync writes what it pulled, so that write isn't stamped as new.
 * One object for every copy of this module: Fast Refresh leaves the old
 * copy's listeners running, and with a flag of their own they stamped each
 * pull as a local change, which looped writes to the gist.
 */
const shared = globalThis as { __syncApplying?: { current: boolean } };
shared.__syncApplying ??= { current: false };
export const applying = shared.__syncApplying;

/**
 * Stamps each record the table changes with the time, and a removal with a
 * tombstone. Loads from storage and a sync's own writes aren't stamped.
 */
export function watchTable(
  table: SyncTable,
  stamps$: Observable<Record<string, Stamp>>,
  now: () => number = Date.now,
) {
  const synced = table.synced ?? (() => true);
  return table.obs$.onChange(({ changes, isFromPersist }) => {
    if (isFromPersist || applying.current) return;
    const at = now();
    const root = table.obs$.peek();
    for (const { path, prevAtPath, valueAtPath } of changes) {
      // The record before this change, for a removal to know what it removed.
      const before = (key: string) => {
        const rest = key.split("/").slice(path.length).join("/");
        return rest ? valueAt(prevAtPath, rest) : prevAtPath;
      };
      const keys =
        path.length >= table.depth
          ? [path.slice(0, table.depth).join("/")]
          : changedKeys(
              prevAtPath,
              valueAtPath,
              table.depth - path.length,
              path.map(String),
            );
      for (const key of keys) {
        if (!synced(key)) continue;
        if (valueAt(root, key) !== undefined) {
          stamps$[key].set({ updatedAt: at });
          continue;
        }
        const prev = path.length <= table.depth ? before(key) : undefined;
        stamps$[key].set({
          updatedAt: at,
          deletedAt: at,
          ...(prev !== undefined && table.local?.(prev) && { local: true }),
        });
      }
    }
  });
}
