import type { Stamp } from "./records";

/**
 * What a device must do to match the synced list: install what is wanted and
 * missing, uninstall what is installed and was removed elsewhere (a
 * tombstone). An installed one the list doesn't name, unstamped, is only
 * not yet seeded, so it stays. `skip` holds ids busy or failed this launch.
 */
export function extensionChanges(
  installed: string[],
  wanted: Record<string, unknown>,
  stamps: Record<string, Stamp>,
  skip: (pkg: string) => boolean,
) {
  const have = new Set(installed);
  return {
    add: Object.keys(wanted).filter((pkg) => !have.has(pkg) && !skip(pkg)),
    remove: installed.filter(
      (pkg) => !(pkg in wanted) && stamps[pkg]?.deletedAt != null && !skip(pkg),
    ),
  };
}
