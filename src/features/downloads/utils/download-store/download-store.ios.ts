import { requireNativeModule } from "expo";
import { File, Paths } from "expo-file-system";
import { bookmarkOf } from "@/utils/picked-folder";
import type { DownloadRoot } from "../download-root";
import { fileSystemStore } from "../file-system-store";
import { idOf } from "../paths";
import type { DownloadStore } from "./download-store";
import { NotDownloadedError } from "./utils/errors";
import { type TreeFile, treeDownloads } from "./utils/tree-downloads";

export { NotDownloadedError } from "./utils/errors";

/** `modules/bookmarked-folder`: the sync's folder, or one picked for downloads. */
const folder = requireNativeModule<{
  listTree(bookmark: string, dir: string): Promise<TreeFile[]>;
  copyIn(bookmark: string, path: string, from: string): Promise<void>;
  copyOut(bookmark: string, path: string, to: string): Promise<void>;
  removeItem(bookmark: string, path: string): Promise<void>;
}>("BookmarkedFolder");

const isNotDownloaded = (error: unknown) =>
  (error as { code?: string })?.code === "NOT_DOWNLOADED" ||
  (error as { message?: string })?.message === "NOT_DOWNLOADED";

function folderStore(location: string): DownloadStore {
  const bookmark = bookmarkOf(location);
  return {
    async list(mangaId, sourceId) {
      return treeDownloads(
        await folder.listTree(bookmark, "downloads"),
        mangaId,
        sourceId,
      );
    },
    async listAll() {
      const tree = await folder.listTree(bookmark, "downloads");
      return tree
        .map((file) => file.path)
        .filter((path) => path.toLowerCase().endsWith(".cbz"));
    },
    put: (path, fileUri) => folder.copyIn(bookmark, path, fileUri),
    async get(path) {
      const name = path.split("/").at(-1) as string;
      const out = new File(
        Paths.cache,
        "downloads-out",
        `${idOf(name) ?? "chapter"}.cbz`,
      );
      try {
        await folder.copyOut(bookmark, path, out.uri);
      } catch (error) {
        throw isNotDownloaded(error) ? new NotDownloadedError(path) : error;
      }
      return out.uri;
    },
    remove: (path) => folder.removeItem(bookmark, path),
  };
}

export function downloadStore(root: DownloadRoot): DownloadStore | undefined {
  return root.kind === "device"
    ? fileSystemStore(Paths.document)
    : folderStore(root.location);
}
