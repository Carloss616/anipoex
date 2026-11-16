import { requireNativeModule } from "expo";

/** `modules/bookmarked-folder`: a folder kept through a security-scoped bookmark. */
const folder = requireNativeModule<{
  pick(): Promise<{ bookmark: string; name: string } | null>;
}>("BookmarkedFolder");

export const canUseFolder = true;

/**
 * The location is the folder's name and its bookmark, so a row can name it
 * without asking iOS: `<name>\n<bookmark>`.
 */
export async function pickFolder() {
  const picked = await folder.pick();
  return picked ? `${picked.name}\n${picked.bookmark}` : undefined;
}

export const folderName = (location: string) =>
  location.slice(0, location.indexOf("\n"));

export const bookmarkOf = (location: string) =>
  location.slice(location.indexOf("\n") + 1);
