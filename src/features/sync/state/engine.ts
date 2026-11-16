import { observable, observe } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import * as Device from "expo-device";
import { AppState, Platform } from "react-native";
import { toast } from "@/components/ui/toast";
import { ObservablePersist } from "@/state/observable-persist";
import { settings$ } from "@/state/settings";
import { desktop } from "@/utils/desktop";
import { SyncError } from "../utils/github";
import { serial } from "../utils/serial";
import {
  retireDevice,
  type SyncDevice,
  type SyncTarget,
  syncTables,
} from "../utils/sync-tables";
import { applying } from "../utils/watch-table";
import { syncMeta$ } from "./sync-meta";
import { TABLES } from "./tables";

/** Waits after a local change, so a scan's burst of writes is one push. */
const DEBOUNCE_MS = 3000;

/** Minutes between syncs while the app is open, until the device picks. */
export const DEFAULT_SYNC_MINUTES = 5;

/** How the other devices list this one. */
const DEVICE_NAME =
  Platform.OS === "web"
    ? desktop
      ? "Mac"
      : "Browser"
    : Platform.OS === "android"
      ? // The name set on the phone ("Galaxy S23 Ultra"), not its model code.
        (Device.deviceName ?? Device.modelName ?? "Android")
      : // iOS hands apps a generic "iPhone" for deviceName.
        (Device.modelName ?? "iPhone");

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** Where a device syncs: GitHub's gist, a synced folder, or both. */
export type TargetKey = "gist" | "folder";

export interface TargetState {
  /** Per table, the hash of the file this device last wrote there. */
  pushed: Record<string, string>;
  lastSync?: number;
  /** The last sync's failure; cleared by the next one that lands. */
  error?: { kind: SyncError["kind"]; message: string };
}

/** Persisted, so the Sync section reads right after a relaunch. */
export const syncState$ = observable({
  targets: {} as Partial<Record<TargetKey, TargetState>>,
  /** The devices whose files the last syncs read, this one included. */
  devices: [] as SyncDevice[],
});

syncObservable(syncState$, {
  persist: { name: "sync-state", plugin: ObservablePersist },
});

// Builds before folders kept the gist's state at the top: carry it over, or
// each device would re-upload every file and announce its first merge again.
const legacy = syncState$.peek() as {
  pushed?: Record<string, string>;
  lastSync?: number;
};
if (legacy.pushed && !syncState$.targets.gist.peek()) {
  syncState$.targets.gist.set({
    pushed: legacy.pushed,
    lastSync: legacy.lastSync,
  });
}
for (const key of ["pushed", "lastSync", "error"]) {
  if (key in legacy)
    (syncState$ as unknown as Record<string, { delete(): void }>)[key].delete();
}

/** The targets a sync is running against now. */
export const syncing$ = observable<Partial<Record<TargetKey, boolean>>>({});

const targets = new Map<TargetKey, SyncTarget>();

/** Every device seen on any target, each at its newest change. */
const mergeDevices = (lists: SyncDevice[][]) => {
  const byId = new Map<string, SyncDevice>();
  for (const device of lists.flat()) {
    const seen = byId.get(device.id);
    if (!seen || device.lastChange > seen.lastChange)
      byId.set(device.id, device);
  }
  return [...byId.values()];
};

async function syncWith(key: TargetKey, target: SyncTarget, device: string) {
  const state$ = syncState$.targets[key];
  syncing$[key].set(true);
  try {
    const first = state$.lastSync.peek() === undefined;
    const { pulled, devices } = await syncTables({
      tables: TABLES,
      meta$: syncMeta$,
      pushed$: state$.pushed,
      device,
      deviceName: DEVICE_NAME,
      target,
    });
    // A target that was stopped meanwhile keeps no state.
    if (targets.get(key) !== target) return [];
    state$.assign({ lastSync: Date.now(), error: undefined });
    // One word on the first merge, which may change what the screens show.
    if (first) {
      const others = devices.filter((d) => d.id !== device).length;
      toast.success(
        others
          ? `Merged with ${plural(others, "device")} · ${plural(pulled, "change")}`
          : "Sync is on",
      );
    }
    return devices;
  } catch (error) {
    // Kept for the Sync section; the next trigger tries again.
    if (targets.get(key) === target) {
      state$.error.set({
        kind: error instanceof SyncError ? error.kind : "other",
        message: error instanceof Error ? error.message : String(error),
      });
    }
    return [];
  } finally {
    syncing$[key].delete();
  }
}

/** Syncs with every target now, or once more right after the sync running. */
export const requestSync = serial(async () => {
  const device = settings$.device.id.peek();
  if (!device || !targets.size) return;
  const seen: SyncDevice[][] = [];
  // One after the other: both write this device's stamps and stores.
  for (const [key, target] of targets) {
    seen.push(await syncWith(key, target, device));
  }
  const devices = mergeDevices(seen);
  if (devices.length) syncState$.devices.set(devices);
});

/**
 * Syncs with `next` as `key` from now on, starting at once; undefined stops
 * and forgets that target's state. Files the target lacks (a new gist, an
 * empty folder) are written whole on its first sync.
 */
export function setSyncTarget(key: TargetKey, next: SyncTarget | undefined) {
  if (next) {
    targets.set(key, next);
    void requestSync();
    return;
  }
  targets.delete(key);
  syncState$.targets[key].delete();
  if (!targets.size) syncState$.devices.set([]);
}

/**
 * Stops syncing with `key` after one last sync, and takes this device's files
 * off it when every record in them is in another device's file too: removing
 * them then loses nothing, and the other devices stop listing this one.
 */
export async function leaveTarget(key: TargetKey) {
  const target = targets.get(key);
  const device = settings$.device.id.peek();
  await requestSync();
  setSyncTarget(key, undefined);
  if (!target || !device) return "kept";
  try {
    return (await retireDevice({ tables: TABLES, device, target }))
      ? "removed"
      : "kept";
  } catch {
    return "failed";
  }
}

let debounce: ReturnType<typeof setTimeout> | undefined;
syncMeta$.onChange(({ isFromPersist }) => {
  if (isFromPersist || applying.current || !targets.size) return;
  clearTimeout(debounce);
  debounce = setTimeout(() => void requestSync(), DEBOUNCE_MS);
});

AppState.addEventListener("change", (state) => {
  if (state === "active") void requestSync();
});

// Brings other devices' changes into an app left open; 0 leaves it to the
// other triggers.
observe((e) => {
  const minutes = settings$.device.syncInterval.get() ?? DEFAULT_SYNC_MINUTES;
  if (!minutes) return;
  const timer = setInterval(() => {
    if (AppState.currentState === "active") void requestSync();
  }, minutes * 60_000);
  e.onCleanup = () => clearInterval(timer);
});

if (typeof window !== "undefined" && "addEventListener" in window) {
  window.addEventListener("online", () => void requestSync());
}
