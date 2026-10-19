import type { RuntimeApi } from "./runtime";
import { unavailableRuntime } from "./utils/unavailable";

/** What the desktop app's preload exposes; absent in a plain browser. */
interface DesktopBridge {
  runtime(
    method: string,
    args: Record<string, unknown>,
  ): Promise<{ result?: unknown; error?: string }>;
}

declare global {
  interface Window {
    anipoex?: DesktopBridge;
  }
}

const desktop = typeof window === "undefined" ? undefined : window.anipoex;

// The sidecar answers `{result}` or `{error}`, so the app shows the extension's own message, not Electron's IPC wrapper.
const call = async <T>(
  bridge: DesktopBridge,
  method: string,
  args: Record<string, unknown> = {},
): Promise<T> => {
  const reply = await bridge.runtime(method, args);
  if (reply.error !== undefined) throw new Error(reply.error);
  return reply.result as T;
};

/** The desktop app runs extensions in its JVM sidecar; a plain browser has no runtime. */
export const isRuntimeAvailable: boolean = desktop !== undefined;

export const runtime: RuntimeApi = desktop
  ? {
      install: (apkUrl, signingKey) =>
        call(desktop, "install", { apkUrl, signingKey }),
      installed: () => call(desktop, "installed"),
      uninstall: (pkg) => call(desktop, "uninstall", { pkg }),
      search: (sourceId, query, page) =>
        call(desktop, "search", { sourceId, query, page }),
      chapters: (sourceId, mangaUrl, title) =>
        call(desktop, "chapters", { sourceId, mangaUrl, title }),
      mangaWebUrl: (sourceId, mangaUrl) =>
        call(desktop, "mangaWebUrl", { sourceId, mangaUrl }),
    }
  : unavailableRuntime;
