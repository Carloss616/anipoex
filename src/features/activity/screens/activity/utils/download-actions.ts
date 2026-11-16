import {
  pauseDownloads,
  resumeDownloads,
  retryAllDownloads,
} from "@/features/downloads";

export interface HeaderAction {
  label: string;
  onPress: () => void;
}

/** The Downloads header's buttons: Retry all once one failed, and Pause or Resume. */
export function downloadActions(
  paused: boolean,
  pending: boolean,
  failed: boolean,
): HeaderAction[] {
  const actions: HeaderAction[] = [];
  if (failed) actions.push({ label: "Retry all", onPress: retryAllDownloads });
  if (paused) actions.push({ label: "Resume", onPress: resumeDownloads });
  else if (pending) actions.push({ label: "Pause", onPress: pauseDownloads });
  return actions;
}
