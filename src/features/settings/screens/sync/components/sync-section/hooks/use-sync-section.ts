import { useValue } from "@legendapp/state/react";
import { Platform } from "react-native";
import { Icons } from "@/components/ui/icon";
import type { MenuItem } from "@/components/ui/menu";
import { openConnect } from "@/features/sync/state/connect-sheet";
import {
  chooseFolder,
  disconnectGitHub,
  stopFolder,
} from "@/features/sync/state/connection";
import {
  DEFAULT_SYNC_MINUTES,
  requestSync,
  syncing$,
  syncState$,
  type TargetKey,
} from "@/features/sync/state/engine";
import { github$ } from "@/features/sync/state/github";
import { unsyncedSummary } from "@/features/sync/state/unsynced";
import { network$ } from "@/state/network";
import { settings$ } from "@/state/settings";
import { desktop } from "@/utils/desktop";
import { openExternal } from "@/utils/open-external";
import { canUseFolder, folderName } from "@/utils/picked-folder";
import { timeAgo } from "@/utils/time-ago";

const ago = (ms: number) => timeAgo(ms / 1000);
const syncNow = () => void requestSync();

/** The moments a sync runs on this platform, beyond the timer. */
const MOMENTS = [
  "When the app opens or comes back",
  "A few seconds after a change",
  ...(Platform.OS === "web" ? ["When the connection comes back"] : []),
  ...(desktop ? ["When a file in the folder changes"] : []),
];
const setSyncInterval = (minutes: number) =>
  settings$.device.syncInterval.set(minutes);

/**
 * One target's status line. Leaves, not the target's object: Legend changes
 * that object in place, so the Compiler's memo kept its first values.
 */
function useTargetStatus(key: TargetKey) {
  const busy = useValue(() => !!syncing$[key].get());
  const lastSync = useValue(syncState$.targets[key].lastSync);
  const error = useValue(syncState$.targets[key].error);
  // Offline isn't a failure to show: the next sync just catches up.
  const failed = !!error && error.kind !== "offline";
  const online = useValue(network$.online);
  const waiting = useValue(() =>
    key === "gist" && !online ? unsyncedSummary(key) : "",
  );
  return {
    busy,
    failed,
    revoked: error?.kind === "auth",
    status: busy
      ? "Syncing…"
      : failed
        ? (error?.message ?? "")
        : waiting
          ? `Waiting for connection · ${waiting}`
          : lastSync
            ? `Synced ${ago(lastSync)}`
            : "Not synced yet",
  };
}

/** What every platform's Sync section shows, and its actions. */
export function useSyncSection() {
  const account = useValue(github$.account);
  const location = useValue(settings$.device.folder);
  const interval = useValue(
    () => settings$.device.syncInterval.get() ?? DEFAULT_SYNC_MINUTES,
  );
  const gistStatus = useTargetStatus("gist");
  const folderStatus = useTargetStatus("folder");

  const gistUrl =
    account?.gistId &&
    `https://gist.github.com/${account.login}/${account.gistId}`;
  const gistMenu: MenuItem[] = [
    { label: "Sync now", icon: Icons.refresh, onPress: syncNow },
    ...(gistUrl
      ? [
          {
            label: "Open gist on GitHub",
            icon: Icons.openExternal,
            onPress: () => openExternal(gistUrl),
          },
        ]
      : []),
    {
      label: "Disconnect",
      destructive: true,
      onPress: () => void disconnectGitHub(),
      onPressMode: "dialog",
      dialogConfig: {
        title: "Disconnect GitHub?",
        description:
          "This device stops syncing, and its files leave the gist once the other devices have its changes. Its data stays here.",
        confirmLabel: "Disconnect",
      },
    },
  ];
  const folderMenu: MenuItem[] = [
    { label: "Sync now", icon: Icons.refresh, onPress: syncNow },
    { label: "Change folder", onPress: () => void chooseFolder() },
    {
      label: "Stop syncing",
      destructive: true,
      onPress: () => void stopFolder(),
      onPressMode: "dialog",
      dialogConfig: {
        title: "Stop syncing through this folder?",
        description:
          "This device stops reading and writing it, and its files leave once the other devices have its changes. Its data stays here.",
        confirmLabel: "Stop",
      },
    },
  ];

  return {
    account,
    gist: { ...gistStatus, menu: gistMenu },
    /** Undefined where folders don't sync (a browser). */
    folder: canUseFolder
      ? {
          // A name that comes out empty still means a folder is chosen.
          name: location ? folderName(location) || "Folder" : undefined,
          ...folderStatus,
          menu: folderMenu,
          choose: () => void chooseFolder(),
        }
      : undefined,
    connected: !!account || !!location,
    interval: { minutes: interval, set: setSyncInterval },
    /** Every moment a sync runs, for the section's info popup. */
    moments: interval
      ? [...MOMENTS, `Every ${interval} min while it's open`]
      : MOMENTS,
    syncNow,
    connect: () => void openConnect(),
  };
}
