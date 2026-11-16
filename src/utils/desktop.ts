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
}

declare global {
  interface Window {
    anipoex?: DesktopBridge;
  }
}

/** The desktop app's bridge; undefined in a plain browser and on native. */
export const desktop: DesktopBridge | undefined =
  typeof window === "undefined" ? undefined : window.anipoex;
