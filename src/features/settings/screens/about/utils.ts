import {
  checkForUpdates,
  isUpdateReady,
  updates$,
} from "@/features/updates/state/updates";
import { settings$ } from "@/state/settings";

export const updateCheck$ = settings$.device.updateCheck;
// Unset counts as on.
export const toggleUpdateCheck = () => updateCheck$.set((on) => on === false);

/** Opens the update already found, or looks for one. */
export function onCheck() {
  if (updates$.available.peek()) updates$.open.set(true);
  else void checkForUpdates({ manual: true });
}

/** The Check for updates row's line; reads observables, so call it in a `Computed`. */
export function checkStatus() {
  if (updates$.checking.get()) return "Checking…";
  const update = updates$.available.get();
  const progress = updates$.progress.get();
  if (update && progress !== undefined)
    return `Downloading ${update.version}… ${Math.round(progress * 100)}%`;
  if (!update) return "Look for a newer version on GitHub";
  return isUpdateReady()
    ? `Version ${update.version} is ready to install`
    : `Version ${update.version} is available`;
}
