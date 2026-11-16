import type { Settings } from "@/state/settings/utils/migrate";

export type DownloadRoot =
  | { kind: "folder"; location: string }
  | { kind: "device" };

/** Where chapter downloads go; without a usable folder, the app's own storage. */
export function downloadRoot(device: Settings["device"]): DownloadRoot {
  const location =
    device.downloadsIn === "folder"
      ? device.downloadsFolder
      : device.downloadsIn === "device"
        ? undefined
        : device.folder;
  return location ? { kind: "folder", location } : { kind: "device" };
}
