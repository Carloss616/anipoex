import { batch, observe } from "@legendapp/state";
import { Platform } from "react-native";
import { toast } from "@/components/ui/toast";
import {
  type InstalledExtension,
  runtime,
} from "@/features/extensions/runtime";
import {
  extensionOperations$,
  extensions$,
  installExtensions,
  loadExtensions,
  uninstallExtensions,
} from "@/features/extensions/state/extensions";
import { installs$ } from "@/features/extensions/state/installs";
import { desktop } from "@/utils/desktop";
import { extensionChanges } from "../utils/extension-changes";
import { serial } from "../utils/serial";
import { applying } from "../utils/watch-table";
import { requestSync, syncState$ } from "./engine";
import { syncMeta$ } from "./sync-meta";

const TABLE = "extensions";

/** A plain browser lists the extensions but can't run them. */
const HAS_RUNTIME = Platform.OS !== "web" || !!desktop;

/** Failed this launch: tried again on the next one, not on every sync. */
const failed = new Set<string>();

const plural = (n: number) => `${n} extension${n === 1 ? "" : "s"}`;

/**
 * Adds what this device has installed and the list doesn't name, unstamped:
 * a removal another device made since still wins over it. An entry from
 * before keys were kept takes this device's key, as a change of its own.
 */
function seed(installed: InstalledExtension[]) {
  const stamps = syncMeta$[TABLE].peek() ?? {};
  const missing = installed.filter(
    (e) => !installs$[e.pkg].peek() && !stamps[e.pkg],
  );
  const keyless = installed.filter((e) => {
    const entry = installs$[e.pkg].peek();
    return entry && !entry.signingKey;
  });
  const entry = (e: InstalledExtension) => ({
    name: e.name,
    signingKey: e.signingKey,
  });
  batch(() => {
    for (const e of keyless) installs$[e.pkg].set(entry(e));
  });
  if (!missing.length) return keyless.length > 0;
  applying.current = true;
  try {
    batch(() => {
      for (const e of missing) installs$[e.pkg].set(entry(e));
    });
  } finally {
    applying.current = false;
  }
  return true;
}

/**
 * Brings this device's extensions in line with the synced list: installs
 * what another device added, uninstalls what one removed.
 */
const reconcile = serial(async () => {
  if (!HAS_RUNTIME) return;
  // A runtime still starting must not read as "nothing installed".
  const installed = await runtime.installed().catch(() => undefined);
  if (!installed) return;
  if (seed(installed)) void requestSync();

  const { add, remove } = extensionChanges(
    installed.map((e) => e.pkg),
    installs$.peek(),
    syncMeta$[TABLE].peek() ?? {},
    (pkg) => !!extensionOperations$[pkg].peek() || failed.has(pkg),
  );
  if (!add.length && !remove.length) return;

  // Both act on the merged catalog: an install needs a repo's download
  // address, and either fails on an extension missing from it.
  await loadExtensions();
  // A repo may have dropped a package since another device installed it: no
  // download here, so it's skipped quietly instead of failing every launch.
  const listed = new Set(extensions$.peek().map((e) => e.id));
  const installable = add.filter((pkg) => listed.has(pkg));
  const wanted = installs$.peek();
  const keys = Object.fromEntries(
    installable.map((pkg) => [pkg, wanted[pkg]?.signingKey]),
  );
  const added = installable.length
    ? await installExtensions(installable, keys)
    : [];
  const removed = remove.length ? await uninstallExtensions(remove) : [];
  for (const pkg of [...add, ...remove]) {
    if (!added.includes(pkg) && !removed.includes(pkg)) failed.add(pkg);
  }
  if (added.length) {
    toast.success(`Installed ${plural(added.length)} from your other devices`);
  }
  if (removed.length) {
    toast.success(`Removed ${plural(removed.length)} as on your other devices`);
  }
});

// After each sync that lands: it may have brought changes to the list, and
// the first one on launch also picks up work a closed app left undone.
observe(() => {
  syncState$.targets.gist.lastSync.get();
  syncState$.targets.folder.lastSync.get();
  void reconcile();
});
