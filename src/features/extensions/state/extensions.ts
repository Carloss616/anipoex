import { observable } from "@legendapp/state";
import { MOCK_EXTENSIONS } from "../mock-extensions";
import { type Extension, hasUpdate } from "../utils/extension";

/**
 * SCAFFOLDING. In memory only: installs reset on reload.
 */
export const extensions$ = observable<Extension[]>(MOCK_EXTENSIONS);

const patch = (id: string, change: (e: Extension) => Partial<Extension>) =>
  extensions$.set((list) =>
    list.map((e) => (e.id === id ? { ...e, ...change(e) } : e)),
  );

export const installExtension = (id: string) =>
  patch(id, () => ({ installed: true }));

export const uninstallExtension = (id: string) =>
  patch(id, () => ({ installed: false }));

export const updateExtension = (id: string) =>
  patch(id, (e) => ({ version: e.latestVersion ?? e.version }));

export function updateAllExtensions() {
  for (const e of extensions$.peek()) if (hasUpdate(e)) updateExtension(e.id);
}

// no registry yet, so a check resets to the mock after a fake round-trip
// (the spinners need one). Wire the real fetch.
export function checkForUpdates() {
  return new Promise<void>((resolve) =>
    setTimeout(() => {
      extensions$.set(MOCK_EXTENSIONS);
      resolve();
    }, 800),
  );
}
