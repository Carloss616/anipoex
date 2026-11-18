import { requireNativeModule } from "expo";
import { Directory, File, Paths } from "expo-file-system";
import { bookmarkOf } from "@/utils/picked-folder";
import type { DownloadRoot } from "../download-root";
import { fileSystemStore } from "../file-system-store";
import { idOf, isDownloadPath } from "../paths";
import type { DownloadStore } from "./download-store";
import { NotDownloadedError } from "./utils/errors";
import {
  intoExisting,
  type TreeFile,
  treeDownloads,
} from "./utils/tree-downloads";

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
  let tree: TreeFile[] | undefined;
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
      return tree.map((file) => file.path).filter(isDownloadPath);
    },
    async put(path, fileUri) {
      // Walked once per store: a move puts every file through the same one.
      tree ??= await folder.listTree(bookmark, "downloads");
      const target = intoExisting(tree, path);
      await folder.copyIn(bookmark, target, fileUri);
      tree.push({ path: target, placeholder: false });
    },
    async get(path) {
      const name = path.split("/").at(-1) as string;
      // Only the last copy stays: the reader unpacks it at once.
      const dir = new Directory(Paths.cache, "downloads-out");
      if (dir.exists) dir.delete();
      dir.create();
      const out = new File(dir, `${idOf(name) ?? "chapter"}.cbz`);
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
