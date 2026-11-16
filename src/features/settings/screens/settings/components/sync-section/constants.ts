export const SYNC_FOOTER =
  "Settings, sources and scans sync across your devices.";

export const HELP_TITLE = "When it syncs";

/** How a sync settles what two devices changed, below the list of moments. */
export const HELP_HOW =
  "Each device writes its own files to the gist or folder, and for each item the newest change wins. A change made offline goes out on the next sync.";

export const FOLDER_HINT = "iCloud Drive, OneDrive or any synced folder";

/** How often an open app looks for other devices' changes, in minutes. */
export const SYNC_INTERVAL_OPTIONS = [
  { minutes: 0, label: "Off" },
  { minutes: 1, label: "1 min" },
  { minutes: 5, label: "5 min" },
  { minutes: 15, label: "15 min" },
];

export const INTERVAL_HINT = "How often an open app looks for changes";
