export type StatusMode =
  | "offline"
  | "sending"
  | "paused"
  | "reading"
  | "scans"
  | "";

export function toStatusMode(s: {
  online: boolean;
  sending: boolean;
  paused: boolean;
  queued: boolean;
  reading: boolean;
  scans: boolean;
}): StatusMode {
  if (!s.online) return "offline";
  if (s.sending) return "sending";
  if (s.paused && s.queued) return "paused";
  if (s.reading) return "reading";
  if (s.scans) return "scans";
  return "";
}
