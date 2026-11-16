import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersist } from "@/state/observable-persist";

/**
 * The extensions this user keeps, by package: what sync carries, so every
 * device installs and removes the same ones. Installing or uninstalling one
 * here writes it; the runtime's own list stays the device's.
 */
export const installs$ = observable<Record<string, { name: string }>>({});

syncObservable(installs$, {
  persist: { name: "extension-installs", plugin: ObservablePersist },
});
