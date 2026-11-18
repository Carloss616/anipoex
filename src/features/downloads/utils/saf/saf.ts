export interface FolderEntry {
  uri: string;
  name: string;
  dir: boolean;
}

export interface Saf {
  /** A folder's entries, names and types included. */
  list(uri: string): Promise<FolderEntry[]>;
  delete(uri: string): Promise<void>;
}

/** SAF calls off the JS thread; only Android has SAF. */
export const saf: Saf | undefined = undefined;
