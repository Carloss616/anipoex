import { desktop } from "@/utils/desktop";
import type { DownloadRoot } from "../download-root";
import type { StoredDownload } from "../paths";
import { NotDownloadedError } from "./utils/errors";

export { NotDownloadedError };

/** Where downloaded chapter files are kept. Paths are relative to the root and start with `downloads/`. */
export interface DownloadStore {
  list(mangaId: number, sourceId: string): Promise<StoredDownload[]>;
  /** Every .cbz under downloads/, for a move. */
  listAll(): Promise<string[]>;
  /** Replaces the file at `path` with the one at `fileUri`. */
  put(path: string, fileUri: string): Promise<void>;
  /** A uri the runtime's unpack can read; NotDownloadedError for a placeholder it can't fetch. */
  get(path: string): Promise<string>;
  /** Removes the file, then its emptied parents up to downloads/. */
  remove(path: string): Promise<void>;
}

/** The desktop app's folder or its own data; undefined in a plain browser. */
export function downloadStore(root: DownloadRoot): DownloadStore | undefined {
  const bridge = desktop;
  if (!bridge) return undefined;
  const where = root.kind === "folder" ? root.location : "app";
  return {
    list: (mangaId, sourceId) =>
      bridge.downloads("list", where, mangaId, sourceId),
    listAll: () => bridge.downloads("listAll", where),
    async put(path, fileUri) {
      await bridge.downloads("put", where, path, fileUri);
    },
    get: (path) =>
      bridge.downloads("get", where, path).catch((error) => {
        throw error?.message === "NOT_DOWNLOADED"
          ? new NotDownloadedError(path)
          : error;
      }),
    async remove(path) {
      await bridge.downloads("remove", where, path);
    },
  };
}
