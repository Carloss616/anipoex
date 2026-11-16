import { desktop } from "@/utils/desktop";
import type { SyncTarget } from "../sync-tables";
import { SYNC_SUBFOLDER } from "./constants";

/** The folder as a sync target, through the desktop main process. */
const syncDir = (location: string) => `${location}/${SYNC_SUBFOLDER}`;

export function createFolderTarget(location: string): SyncTarget {
  const bridge = desktop;
  if (!bridge) throw new Error("No folder to sync through here");
  const dir = syncDir(location);
  return {
    list: () => bridge.folder("list", dir),
    read: async (name) => (await bridge.folder("read", dir, name)) ?? undefined,
    write: async (files) => {
      await bridge.folder("write", dir, files);
    },
    remove: async (names) => {
      await bridge.folder("remove", dir, names);
    },
  };
}

/** Calls `onChange` when another device's file lands in the folder. */
export function watchFolder(location: string, onChange: () => void) {
  void desktop?.folder("watch", syncDir(location));
  const off = desktop?.onFolderChange(onChange);
  return () => {
    off?.();
    void desktop?.folder("watch", null);
  };
}
