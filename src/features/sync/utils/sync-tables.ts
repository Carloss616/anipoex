import { batch, type Observable, type ObservableParam } from "@legendapp/state";
import {
  localRecords,
  mergeRecords,
  PURGE_AFTER_MS,
  purge,
  type Records,
  type Stamp,
  stampOf,
  valueAt,
} from "./records";
import {
  type DeviceKind,
  parseSyncFile,
  SYNC_FORMAT,
  serializeSyncFile,
  syncFileName,
} from "./sync-file";
import { applying, type SyncTable } from "./watch-table";

/** Where the files live: a gist or a folder, behind the same calls. */
export interface SyncTarget {
  /** Every file name on the target. */
  list(): Promise<string[]>;
  /** A file's text; undefined when it is gone. */
  read(name: string): Promise<string | undefined>;
  /** Writes these files, each whole, in one go when the target can. */
  write(files: Record<string, string>): Promise<void>;
  /** Deletes these files. */
  remove(names: string[]): Promise<void>;
}

export interface SyncTablesOptions {
  tables: SyncTable[];
  meta$: Observable<Record<string, Record<string, Stamp>>>;
  /** Per table, the hash of the file this device last wrote. */
  pushed$: Observable<Record<string, string> | undefined>;
  device: string;
  /** Written in this device's files, so others can name it. */
  deviceName?: string;
  /** Written in this device's files, for its icon on the others. */
  deviceKind?: DeviceKind;
  target: SyncTarget;
  now?: () => number;
}

/** A device whose files are on the target, and its latest stamp there. */
export interface SyncDevice {
  id: string;
  name?: string;
  kind?: DeviceKind;
  lastChange: number;
}

/** FNV-1a: tells a changed file apart; not for anything secret. */
export function hash(text: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

type Node = ObservableParam & Record<string, ObservableParam>;

const nodeAt = (obs$: ObservableParam, key: string): ObservableParam =>
  key === ""
    ? obs$
    : key.split("/").reduce((node, part) => (node as Node)[part], obs$);

/**
 * Writes the records that won over this device's into the store and takes
 * their stamps; resolves to how many changed the store.
 */
function apply(
  table: SyncTable,
  merged: Records,
  local: Records,
  stamps$: Observable<Record<string, Stamp>>,
) {
  const root = table.obs$.peek();
  let changed = 0;
  for (const [key, record] of Object.entries(merged)) {
    if (record === local[key]) continue;
    const { value, ...stamp } = record;
    stamps$[key].set(stamp);
    const current = valueAt(root, key);
    if (record.deletedAt != null) {
      if (current === undefined) continue;
      nodeAt(table.obs$, key).delete();
    } else if (JSON.stringify(current) !== JSON.stringify(value)) {
      // Parsed fresh from the file, so no one else holds this object.
      nodeAt(table.obs$, key).set(value);
    } else continue;
    changed++;
  }
  // A store shape another build wrote is read as this build reads its own.
  if (changed && table.normalize) {
    table.obs$.set(table.normalize(table.obs$.peek()));
  }
  return changed;
}

/**
 * One sync: reads every device's files, merges them with this device's
 * records, applies what won, and writes this device's files that changed.
 * Resolves to how many records it changed in this device's stores, and the
 * devices whose files it read.
 */
export async function syncTables({
  tables,
  meta$,
  pushed$,
  device,
  deviceName,
  deviceKind,
  target,
  now = Date.now,
}: SyncTablesOptions) {
  const names = await target.list();
  const out: Record<string, string> = {};
  const hashes: Record<string, string> = {};
  const devices = new Map<string, SyncDevice>();
  let pulled = 0;

  for (const table of tables) {
    const prefix = `anipoex-${table.name}.`;
    const texts = await Promise.all(
      names
        .filter((name) => name.startsWith(prefix) && name.endsWith(".json"))
        .map((name) => target.read(name)),
    );
    const remote = texts.flatMap((text) => {
      const file = text && parseSyncFile(text, table.name);
      return file ? [file] : [];
    });
    for (const file of remote) {
      const seen = devices.get(file.device);
      const latest = Math.max(
        seen?.lastChange ?? 0,
        ...Object.values(file.records).map((r) => r.deletedAt ?? r.updatedAt),
      );
      devices.set(file.device, {
        id: file.device,
        name: file.name,
        kind: file.kind,
        lastChange: latest,
      });
    }

    const stamps = meta$[table.name].peek() ?? {};
    const local = localRecords(
      table.obs$.peek(),
      table.depth,
      stamps,
      table.synced,
    );
    const merged = mergeRecords(local, remote);
    const kept = purge(merged, now());

    applying.current = true;
    try {
      batch(() => {
        pulled += apply(table, merged, local, meta$[table.name]);
        for (const key of Object.keys(merged)) {
          if (!(key in kept)) meta$[table.name][key].delete();
        }
      });
    } finally {
      applying.current = false;
    }

    const text = serializeSyncFile({
      format: SYNC_FORMAT,
      device,
      ...(deviceName && { name: deviceName }),
      ...(deviceKind && { kind: deviceKind }),
      table: table.name,
      records: kept,
    });
    const h = hash(text);
    const name = syncFileName(table.name, device);
    // A file gone from the target (a new gist) is written even if unchanged.
    if (h !== pushed$[table.name].peek() || !names.includes(name)) {
      out[name] = text;
      hashes[table.name] = h;
    }
  }

  if (Object.keys(out).length) await target.write(out);
  // Only a write that landed counts as pushed; a failed one is retried whole.
  for (const [name, h] of Object.entries(hashes)) pushed$[name].set(h);
  return { pulled, devices: [...devices.values()] };
}

/**
 * A device leaving a target takes its files with it, when nothing is lost:
 * every record in them is already, as new or newer, in another device's file.
 * Resolves to whether they were removed.
 */
export async function retireDevice({
  tables,
  device,
  target,
  now = Date.now,
}: Pick<SyncTablesOptions, "tables" | "device" | "target" | "now">) {
  const names = await target.list();
  const own = new Set(tables.map((table) => syncFileName(table.name, device)));
  for (const table of tables) {
    const prefix = `anipoex-${table.name}.`;
    const files = (
      await Promise.all(
        names
          .filter((name) => name.startsWith(prefix) && name.endsWith(".json"))
          .map(async (name) => {
            const text = await target.read(name);
            return text ? parseSyncFile(text, table.name) : undefined;
          }),
      )
    ).filter((file) => file !== undefined);
    const mine = files.find((file) => file.device === device);
    const rest = files.filter((file) => file.device !== device);
    // No other device on the target: no one to lose anything, and the data
    // stays on this one.
    if (!mine || !rest.length) continue;
    const others = mergeRecords({}, rest);
    const purged = now() - PURGE_AFTER_MS;
    const carried = Object.entries(mine.records).every(([key, record]) => {
      // Every device has applied a removal this old and may have dropped it.
      if (record.deletedAt != null && record.deletedAt <= purged) return true;
      const other = others[key];
      return other !== undefined && stampOf(other) >= stampOf(record);
    });
    if (!carried) return false;
  }
  await target.remove(names.filter((name) => own.has(name)));
  return true;
}
