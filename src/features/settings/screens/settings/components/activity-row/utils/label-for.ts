export interface ActivityState {
  online: boolean;
  waiting: number;
  paused: boolean;
  downloadsLeft: number;
  scans: number;
}

/** The row's status line: the most pressing state first, "" when idle. */
export function labelFor(s: ActivityState) {
  if (!s.online) return "Offline";
  if (s.waiting) return `Sending ${s.waiting}`;
  if (s.paused && s.downloadsLeft) return "Paused";
  if (s.scans) return `${s.scans} running`;
  if (s.downloadsLeft) return `${s.downloadsLeft} downloading`;
  return "";
}
