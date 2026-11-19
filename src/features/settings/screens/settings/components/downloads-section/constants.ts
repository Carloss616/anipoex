import type { SaveTo } from "./utils";

export const SAVE_TO_OPTIONS: { id: SaveTo; label: string }[] = [
  { id: "sync", label: "Sync Folder" },
  { id: "folder", label: "New Folder" },
  { id: "device", label: "This device" },
];

export const NO_SYNC_FOLDER = "No sync folder: they stay on this device";

export const DOWNLOADS_FOOTER =
  "Cloud apps may keep only a placeholder: mark the folder to stay downloaded to read offline.";
