import type { Observable } from "@legendapp/state";
import type { Settings } from "@/state/settings/utils/migrate";
import { folderName } from "@/utils/picked-folder";

type Device = Settings["device"];
export type SaveTo = NonNullable<Device["downloadsIn"]>;
type Pick = () => Promise<string | undefined>;

/** Asks for the downloads folder; a dismissed picker keeps the one there. */
export async function changeFolder(device$: Observable<Device>, pick: Pick) {
  const location = await pick();
  if (location) device$.downloadsFolder.set(location);
  return !!location;
}

/**
 * Sets where downloads go; "folder" with none chosen yet asks for one first.
 * Resolves false when nothing changed (the picker was dismissed).
 */
export async function saveTo(
  device$: Observable<Device>,
  option: SaveTo,
  pick: Pick,
) {
  const needsFolder = option === "folder" && !device$.downloadsFolder.peek();
  if (needsFolder && !(await changeFolder(device$, pick))) return false;
  device$.downloadsIn.set(option);
  return true;
}

// A name that comes out empty still means a folder is chosen.
export const folderLabel = (location: string | undefined) =>
  location ? folderName(location) || "Folder" : "None chosen";
