import { Directory, Paths } from "expo-file-system";
import type { DownloadRoot } from "../download-root";
import { fileSystemStore } from "../file-system-store";

export { NotDownloadedError } from "./utils/errors";

export function downloadStore(root: DownloadRoot) {
  return fileSystemStore(
    root.kind === "folder" ? new Directory(root.location) : Paths.document,
  );
}
