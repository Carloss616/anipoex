import { Directory } from "expo-file-system";

export const canUseFolder = true;

/** A folder picked through the system picker; its permission persists. */
export async function pickFolder() {
  try {
    return (await Directory.pickDirectoryAsync()).uri;
  } catch (error) {
    if ((error as { code?: string }).code === "ERR_PICKER_CANCELLED") return;
    throw error;
  }
}

/** A SAF document's name: its URI's last segment, decoded; a picked tree ends in `/`. */
export const folderName = (uri: string) =>
  decodeURIComponent(uri).split(/[/:]/).filter(Boolean).pop() ?? uri;

export const bookmarkOf = (location: string) => location;
