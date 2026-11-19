import { folderName } from "@/utils/picked-folder";

// A name that comes out empty still means a folder is chosen.
export const folderLabel = (location: string | undefined) =>
  location ? folderName(location) || "Folder" : "None chosen";
