import { useValue } from "@legendapp/state/react";
import { type IconName, Icons } from "@/components/ui/icon";
import { syncState$ } from "@/features/sync/state/engine";
import { github$ } from "@/features/sync/state/github";
import type { DeviceKind } from "@/features/sync/utils/sync-file";
import { settings$ } from "@/state/settings";
import { timeAgo } from "@/utils/time-ago";

const ago = (ms: number) => timeAgo(ms / 1000);

const KIND_ICONS: Record<DeviceKind, IconName> = {
  phone: Icons.devicePhone,
  tablet: Icons.deviceTablet,
  computer: Icons.deviceComputer,
  browser: Icons.deviceBrowser,
};

/** The devices that sync, this one first; none while nothing is connected. */
export function useSyncDevices() {
  const connected = useValue(
    () => !!github$.account.get() || !!settings$.device.folder.get(),
  );
  const devices = useValue(syncState$.devices);
  const me = useValue(settings$.device.id);

  if (!connected) return [];
  return [...devices]
    .sort((a, b) =>
      a.id === me ? -1 : b.id === me ? 1 : b.lastChange - a.lastChange,
    )
    .map((device) => ({
      id: device.id,
      /** The row shows a "This device" badge. */
      current: device.id === me,
      // A build from before kinds writes none: the generic icon until it updates.
      icon: device.kind ? KIND_ICONS[device.kind] : Icons.device,
      title:
        device.name ?? (device.id === me ? "This device" : "Another device"),
      detail: device.lastChange
        ? `Changed ${ago(device.lastChange)}`
        : undefined,
    }));
}
