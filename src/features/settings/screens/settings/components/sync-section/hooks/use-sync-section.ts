import { useValue } from "@legendapp/state/react";
import { Icons } from "@/components/ui/icon";
import type { MenuItem } from "@/components/ui/menu";
import { openConnect } from "@/features/sync/state/connect-sheet";
import { disconnectGitHub } from "@/features/sync/state/connection";
import {
  requestSync,
  syncing$,
  syncState$,
} from "@/features/sync/state/engine";
import { github$ } from "@/features/sync/state/github";
import { settings$ } from "@/state/settings";
import { openExternal } from "@/utils/open-external";
import { timeAgo } from "@/utils/time-ago";

const ago = (ms: number) => timeAgo(ms / 1000);

/** What every platform's Sync section shows, and its actions. */
export function useSyncSection() {
  const account = useValue(github$.account);
  const syncing = useValue(syncing$);
  const lastSync = useValue(syncState$.lastSync);
  const error = useValue(syncState$.error);
  const devices = useValue(syncState$.devices);
  const me = useValue(settings$.device.id);

  const revoked = error?.kind === "auth";
  // Offline isn't a failure to show: the next sync just catches up.
  const failed = !!error && error.kind !== "offline";
  const status = syncing
    ? "Syncing…"
    : failed
      ? (error?.message ?? "")
      : lastSync
        ? `Synced ${ago(lastSync)}`
        : "Not synced yet";

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
  const syncNow = () => void requestSync();
  const menu: MenuItem[] = [
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
      onPress: disconnectGitHub,
      onPressMode: "dialog",
      dialogConfig: {
        title: "Disconnect GitHub?",
        description:
          "This device stops syncing. The gist and what it holds stay on GitHub.",
        confirmLabel: "Disconnect",
      },
    },
  ];

  return {
    account,
    syncing,
    revoked,
    failed,
    status,
    devices: rows,
    menu,
    syncNow,
    connect: () => void openConnect(),
  };
}
