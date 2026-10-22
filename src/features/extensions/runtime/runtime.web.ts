import { desktop } from "@/utils/desktop";
import type { RuntimeApi } from "./runtime";
import { bridgeRuntime } from "./utils/bridge-runtime";
import { unavailableRuntime } from "./utils/unavailable";

/** The desktop app runs extensions in its JVM sidecar; a plain browser has no runtime. */
export const isRuntimeAvailable: boolean = desktop !== undefined;

export const runtime: RuntimeApi = desktop
  ? {
      ...bridgeRuntime(desktop.runtime),
      // Main already swapped each page for its own URL, which it serves through the source.
      pageImage: async (_, page) => page.imageUrl,
    }
  : unavailableRuntime;
