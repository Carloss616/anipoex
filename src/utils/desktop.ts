/** What the desktop app's preload exposes as `window.anipoex`. */
export interface DesktopBridge {
  runtime(
    method: string,
    args: Record<string, unknown>,
  ): Promise<{ result?: unknown; error?: string }>;
  signIn(url: string): Promise<string | null>;
}

declare global {
  interface Window {
    anipoex?: DesktopBridge;
  }
}

/** The desktop app's bridge; undefined in a plain browser and on native. */
export const desktop: DesktopBridge | undefined =
  typeof window === "undefined" ? undefined : window.anipoex;
