import { observable } from "@legendapp/state";
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
  type SyncDevice,
  type SyncTarget,
  syncTables,
} from "../utils/sync-tables";
import { applying } from "../utils/watch-table";
import { syncMeta$ } from "./sync-meta";
import { TABLES } from "./tables";

/** Waits after a local change, so a scan's burst of writes is one push. */
const DEBOUNCE_MS = 3000;
const INTERVAL_MS = 5 * 60 * 1000;

/** How the other devices list this one. */
const DEVICE_NAME =
  Platform.OS === "web"
    ? desktop
      ? "Mac"
      : "Browser"
    : (Device.modelName ?? (Platform.OS === "ios" ? "iPhone" : "Android"));

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** Persisted, so the Sync section reads right after a relaunch. */
export const syncState$ = observable({
  /** Per table, the hash of the file this device last wrote. */
  pushed: {} as Record<string, string>,
  lastSync: undefined as number | undefined,
  /** The devices whose files the last sync read, this one included. */
  devices: [] as SyncDevice[],
  /** The last sync's failure; cleared by the next one that lands. */
  error: undefined as { kind: SyncError["kind"]; message: string } | undefined,
});

syncObservable(syncState$, {
  persist: { name: "sync-state", plugin: ObservablePersist },
});

/** A sync is running now. */
export const syncing$ = observable(false);

let target: SyncTarget | undefined;

/** Syncs now, or once more right after the sync running. */
export const requestSync = serial(async () => {
  const current = target;
  const device = settings$.device.id.peek();
  if (!current || !device) return;
  syncing$.set(true);
  try {
    const first = syncState$.lastSync.peek() === undefined;
    const { pulled, devices } = await syncTables({
      tables: TABLES,
      meta$: syncMeta$,
      pushed$: syncState$.pushed,
      device,
      deviceName: DEVICE_NAME,
      target: current,
    });
    syncState$.assign({ lastSync: Date.now(), error: undefined, devices });
    // One word on the first merge, which may change what the screens show.
    if (first) {
      const others = devices.filter((d) => d.id !== device).length;
      toast.success(
        others
          ? `Merged with ${plural(others, "device")} · ${plural(pulled, "change")}`
          : "Sync is on",
      );
    }
  } catch (error) {
    // Kept for the Sync section; the next trigger tries again.
    syncState$.error.set({
      kind: error instanceof SyncError ? error.kind : "other",
      message: error instanceof Error ? error.message : String(error),
    });
  } finally {
    syncing$.set(false);
  }
});

/**
 * Syncs with `next` from now on, starting at once; undefined stops. Files
 * the target lacks (a new gist) are written whole on the first sync.
 */
export function setSyncTarget(next: SyncTarget | undefined) {
  target = next;
  if (next) void requestSync();
}

let debounce: ReturnType<typeof setTimeout> | undefined;
syncMeta$.onChange(({ isFromPersist }) => {
  if (isFromPersist || applying.current || !target) return;
  clearTimeout(debounce);
  debounce = setTimeout(() => void requestSync(), DEBOUNCE_MS);
});

AppState.addEventListener("change", (state) => {
  if (state === "active") void requestSync();
});

setInterval(() => {
  if (AppState.currentState === "active") void requestSync();
}, INTERVAL_MS);

if (typeof window !== "undefined" && "addEventListener" in window) {
  window.addEventListener("online", () => void requestSync());
}
