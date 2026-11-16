/** When a record last changed, and when it was removed if it was. */
export interface Stamp {
  updatedAt: number;
  deletedAt?: number;
  /** A removal of a record this device kept to itself: it isn't published. */
  local?: true;
}

/** One record of a synced table; a removed one keeps its stamp, no value. */
export interface SyncRecord extends Stamp {
  value?: unknown;
}

/** A table's records by key: the path to the record, joined by `/`. */
export type Records = Record<string, SyncRecord>;

/** Tombstones older than this are dropped: every device has seen them. */
export const PURGE_AFTER_MS = 90 * 24 * 60 * 60 * 1000;

/** When a record last changed, its removal included. */
export const stampOf = (record: Stamp) =>
  Math.max(record.updatedAt, record.deletedAt ?? 0);

const asObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

/** Every record `depth` levels down `value`, with its key. */
export function leaves(value: unknown, depth: number, prefix: string[] = []) {
  if (depth === 0) {
    return value === undefined ? [] : [[prefix.join("/"), value] as const];
  }
  return Object.entries(asObject(value)).flatMap(
    ([key, child]): (readonly [string, unknown])[] =>
      leaves(child, depth - 1, [...prefix, key]),
  );
}

/** The record under `key` in `root`, as `leaves` names it. */
export function valueAt(root: unknown, key: string) {
  if (key === "") return root;
  return key.split("/").reduce<unknown>((at, part) => asObject(at)[part], root);
}

/**
 * The keys of the records that differ between `prev` and `next`, `depth`
 * levels down: what a change above record level touched.
 */
export function changedKeys(
  prev: unknown,
  next: unknown,
  depth: number,
  prefix: string[] = [],
): string[] {
  if (depth === 0) {
    // Key order can make equal records look different: that only stamps one
    // record more than needed, never misses one.
    return JSON.stringify(prev) === JSON.stringify(next)
      ? []
      : [prefix.join("/")];
  }
  const a = asObject(prev);
  const b = asObject(next);
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].flatMap((key) =>
    changedKeys(a[key], b[key], depth - 1, [...prefix, key]),
  );
}

/**
 * This device's records: what the table holds, stamped when last changed
 * (0 for data from before sync), plus the removals still remembered.
 */
export function localRecords(
  value: unknown,
  depth: number,
  stamps: Record<string, Stamp>,
  synced: (key: string) => boolean = () => true,
): Records {
  const out: Records = {};
  for (const [key, record] of leaves(value, depth)) {
    if (synced(key))
      out[key] = { value: record, updatedAt: stamps[key]?.updatedAt ?? 0 };
  }
  for (const [key, stamp] of Object.entries(stamps)) {
    if (stamp.deletedAt != null && !(key in out) && synced(key)) {
      out[key] = { updatedAt: stamp.updatedAt, deletedAt: stamp.deletedAt };
    }
  }
  return out;
}

/**
 * Every record at its newest stamp. `remote` is each device's file from the
 * target; on a tie the target's record beats this device's, so a device that
 * joins adopts what is there and only adds what it alone has. Files are read
 * in device order, so every device settles a tie between two the same way.
 */
export function mergeRecords(
  local: Records,
  remote: { device: string; records: Records }[],
): Records {
  const out: Records = { ...local };
  const fromLocal = new Set(Object.keys(local));
  const files = [...remote].sort((a, b) => a.device.localeCompare(b.device));
  for (const { records } of files) {
    for (const [key, record] of Object.entries(records)) {
      const current = out[key];
      const newer =
        !current ||
        stampOf(record) > stampOf(current) ||
        (stampOf(record) === stampOf(current) && fromLocal.has(key));
      if (!newer) continue;
      out[key] = record;
      fromLocal.delete(key);
    }
  }
  return out;
}

/** Without tombstones old enough that every device has applied them. */
export function purge(records: Records, now: number): Records {
  return Object.fromEntries(
    Object.entries(records).filter(
      ([, record]) =>
        record.deletedAt == null || record.deletedAt > now - PURGE_AFTER_MS,
    ),
  );
}
