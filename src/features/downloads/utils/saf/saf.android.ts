import { requireNativeModule } from "expo";
import type { FolderEntry, Saf } from "./saf";

const native = requireNativeModule<{
  listFolder(uri: string): Promise<FolderEntry[]>;
  deleteDocument(uri: string): Promise<void>;
}>("ExtensionRuntime");

export const saf: Saf = {
  list: (uri) => native.listFolder(uri),
  delete: (uri) => native.deleteDocument(uri),
};
