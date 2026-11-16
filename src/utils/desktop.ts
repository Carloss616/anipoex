import type { StoredDownload } from "@/features/downloads/utils/paths";

/** What the desktop app's preload exposes as `window.anipoex`. */
export interface DesktopBridge {
  runtime(
    method: string,
    args: Record<string, unknown>,
  ): Promise<{ result?: unknown; error?: string }>;
  signIn(url: string): Promise<string | null>;
  /** The Dock icon's progress bar, 0 to 1; below 0 hides it. */
  scanProgress(fraction: number): void;
  /** POSTs to GitHub's Device Flow, which a page can't reach (no CORS). */
  github(
    url: string,
    body: Record<string, string>,
  ): Promise<Record<string, unknown>>;
  /** The sync folder, through the main process: pick, list, read, write, remove, watch. */
  folder(method: "pick"): Promise<string | null>;
  folder(method: "list", dir: string): Promise<string[]>;
  folder(method: "read", dir: string, name: string): Promise<string | null>;
  folder(
    method: "write",
    dir: string,
    files: Record<string, string>,
  ): Promise<boolean>;
  folder(method: "watch", dir: string | null): Promise<boolean>;
  folder(method: "remove", dir: string, names: string[]): Promise<boolean>;
  /**
   * Downloaded chapters under a root (an absolute folder, or "app" for the
   * app's own data); paths are relative to it and start with `downloads/`.
   * `get` rejects with "NOT_DOWNLOADED" for a cloud file that never arrived.
   */
  downloads(
    method: "list",
    root: string,
    mangaId: number,
    sourceId: string,
  ): Promise<StoredDownload[]>;
  downloads(method: "listAll", root: string): Promise<string[]>;
  downloads(
    method: "put",
    root: string,
    path: string,
    fromUri: string,
  ): Promise<boolean>;
  downloads(method: "get", root: string, path: string): Promise<string>;
  downloads(method: "remove", root: string, path: string): Promise<boolean>;
  /** Runs `callback` when a sync file in the watched folder changes. */
  onFolderChange(callback: () => void): () => void;
}

declare global {
  interface Window {
    anipoex?: DesktopBridge;
  }
}

/** The desktop app's bridge; undefined in a plain browser and on native. */
export const desktop: DesktopBridge | undefined =
  typeof window === "undefined" ? undefined : window.anipoex;
