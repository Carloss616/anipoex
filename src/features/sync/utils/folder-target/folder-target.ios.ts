import type { SyncTarget } from "../sync-tables";

/** iOS needs a security-scoped bookmark to keep a folder (phase 6). */
export const canUseFolder = false;

export const pickFolder = async (): Promise<string | undefined> => undefined;

export const folderName = (location: string) => location;

export function createFolderTarget(_location: string): SyncTarget {
  throw new Error("Folders don't sync on iOS yet");
}

export const watchFolder =
  (_location: string, _onChange: () => void) => () => {};
