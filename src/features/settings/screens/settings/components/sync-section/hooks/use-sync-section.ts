import { useValue } from "@legendapp/state/react";
import { Icons } from "@/components/ui/icon";
import type { MenuItem } from "@/components/ui/menu";
import { openConnect } from "@/features/sync/state/connect-sheet";
import {
  chooseFolder,
  disconnectGitHub,
  stopFolder,
} from "@/features/sync/state/connection";
import {
  requestSync,
  syncing$,
  syncState$,
  type TargetKey,
} from "@/features/sync/state/engine";
import { github$ } from "@/features/sync/state/github";
import { canUseFolder, folderName } from "@/features/sync/utils/folder-target";
import { settings$ } from "@/state/settings";
import { openExternal } from "@/utils/open-external";
import { timeAgo } from "@/utils/time-ago";

const ago = (ms: number) => timeAgo(ms / 1000);
const syncNow = () => void requestSync();

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
  return {
    busy,
    failed,
    revoked: error?.kind === "auth",
    status: busy
      ? "Syncing…"
      : failed
        ? (error?.message ?? "")
        : lastSync
          ? `Synced ${ago(lastSync)}`
          : "Not synced yet",
  };
}

/** What every platform's Sync section shows, and its actions. */
export function useSyncSection() {
  const account = useValue(github$.account);
  const devices = useValue(syncState$.devices);
  const me = useValue(settings$.device.id);
  const location = useValue(settings$.device.folder);
  const gistStatus = useTargetStatus("gist");
  const folderStatus = useTargetStatus("folder");

  const rows = [...devices]
    .sort((a, b) =>
      a.id === me ? -1 : b.id === me ? 1 : b.lastChange - a.lastChange,
    )
    .map((device) => ({
      id: device.id,
      title:
        device.id === me ? "This device" : (device.name ?? "Another device"),
      detail:
        device.id === me
          ? device.name
          : device.lastChange
            ? `Changed ${ago(device.lastChange)}`
            : undefined,
    }));

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
    /** Undefined where folders don't sync (a browser; iOS for now). */
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
    devices: rows,
    syncNow,
    connect: () => void openConnect(),
  };
}
