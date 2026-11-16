import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersist } from "@/state/observable-persist";

export interface Install {
  name: string;
  /**
   * The key its build is signed with: which repo it came from, when two list
   * the same package (a fork). Absent in entries from before keys were kept.
   */
  signingKey?: string;
}

/**
 * The extensions this user keeps, by package: what sync carries, so every
 * device installs and removes the same ones. Installing or uninstalling one
 * here writes it; the runtime's own list stays the device's.
 */
export const installs$ = observable<Record<string, Install>>({});

syncObservable(installs$, {
  persist: { name: "extension-installs", plugin: ObservablePersist },
});
