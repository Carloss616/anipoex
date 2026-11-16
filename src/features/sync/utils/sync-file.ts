import type { Records, SyncRecord } from "./records";

/** Bumped when a file written now can't be read by an older build. */
export const SYNC_FORMAT = 1;

/** What a device is, for its icon in the Sync section. */
export type DeviceKind = "phone" | "tablet" | "computer" | "browser";

const KINDS: readonly unknown[] = ["phone", "tablet", "computer", "browser"];

/** One device's copy of one table, as stored on the target. */
export interface SyncFile {
  format: number;
  device: string;
  /** The device as people call it ("iPhone 16"), for the Sync section. */
  name?: string;
  kind?: DeviceKind;
  table: string;
  records: Records;
}

/** The file's name on the target: flat, since a gist can't hold folders. */
export const syncFileName = (table: string, device: string) =>
  `anipoex-${table}.${device}.json`;

/** Indented, so the gist's revision history reads as a diff. */
export const serializeSyncFile = (file: SyncFile) =>
  `${JSON.stringify(file, null, 2)}\n`;

const isRecord = (value: unknown): value is SyncRecord => {
  if (!value || typeof value !== "object") return false;
  const { updatedAt, deletedAt } = value as Record<string, unknown>;
  if (!Number.isFinite(updatedAt)) return false;
  // A live record without its value would apply as a silent removal.
  return deletedAt === undefined
    ? "value" in value
    : Number.isFinite(deletedAt);
};

/**
 * The file in `text`, or undefined when it isn't one this build can read: a
 * newer format, another table, or anything edited into a broken shape. Bad
 * records are dropped one by one, so one hand edit doesn't lose the file.
 */
export function parseSyncFile(
  text: string,
  table: string,
): SyncFile | undefined {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return undefined;
  }
  if (!raw || typeof raw !== "object") return undefined;
  const { format, device, name, kind, records } = raw as Record<
    string,
    unknown
  >;
  if (format !== SYNC_FORMAT || typeof device !== "string") return undefined;
  if ((raw as SyncFile).table !== table) return undefined;
  if (!records || typeof records !== "object") return undefined;
  return {
    format,
    device,
    ...(typeof name === "string" && { name }),
    // A kind a newer build added is left out, so the row takes the generic icon.
    ...(KINDS.includes(kind) && { kind: kind as DeviceKind }),
    table,
    records: Object.fromEntries(
      Object.entries(records).filter(([, record]) => isRecord(record)),
    ) as Records,
  };
}
