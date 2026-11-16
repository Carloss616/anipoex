import { Paths } from "expo-file-system";
import type { DownloadRoot } from "../download-root";
import { fileSystemStore } from "../file-system-store";
import type { DownloadStore } from "./download-store";

export { NotDownloadedError } from "./utils/errors";

export function downloadStore(root: DownloadRoot): DownloadStore | undefined {
  // The bookmarked-folder store comes from modules/bookmarked-folder.
  return root.kind === "device" ? fileSystemStore(Paths.document) : undefined;
}
