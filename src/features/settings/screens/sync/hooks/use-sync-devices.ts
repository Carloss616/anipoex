import { useValue } from "@legendapp/state/react";
import { type IconName, Icons } from "@/components/ui/icon";
import type { MenuItem } from "@/components/ui/menu";
import { toast } from "@/components/ui/toast";
import { forgetDevice, syncState$ } from "@/features/sync/state/engine";
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

async function forget(id: string, title: string) {
  if (await forgetDevice(id)) toast.success(`Forgot ${title}`);
  else
    toast.error(
      `${title} stays until this device has synced its last changes. Try again later.`,
    );
}

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
    .map((device) => {
      const title =
        device.name ?? (device.id === me ? "This device" : "Another device");
      const menu: MenuItem[] | undefined =
        device.id === me
          ? undefined
          : [
              {
                label: "Forget",
                destructive: true,
                onPress: () => void forget(device.id, title),
                onPressMode: "dialog",
                dialogConfig: {
                  title: `Forget ${title}?`,
                  description:
                    "Its files leave the sync once this device has its changes, so nothing is lost. A device still in use comes back with its next sync.",
                  confirmLabel: "Forget",
                },
              },
            ];
      return {
        id: device.id,
        /** The row shows a "This device" badge. */
        current: device.id === me,
        // A build from before kinds writes none: the generic icon until it updates.
        icon: device.kind ? KIND_ICONS[device.kind] : Icons.device,
        title,
        detail: device.lastChange
          ? `Changed ${ago(device.lastChange)}`
          : undefined,
        /** Another device's actions; none on this one. */
        menu,
      };
    });
}
