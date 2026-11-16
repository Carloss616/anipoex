import { desktop } from "@/utils/desktop";

/** Desktop picks a folder; a browser has no file system to reach. */
export const canUseFolder = !!desktop;

/** A folder the user picks, as a location; undefined when dismissed. */
export async function pickFolder() {
  return (await desktop?.folder("pick")) ?? undefined;
}

/** The folder's own name, to show. */
export const folderName = (location: string) =>
  location.split(/[\\/]/).filter(Boolean).pop() ?? location;

/** What the native folder module takes for this location: on iOS, its bookmark. */
export const bookmarkOf = (location: string) => location;
