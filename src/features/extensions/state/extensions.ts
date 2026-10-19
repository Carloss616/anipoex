import { observable } from "@legendapp/state";
import { toast } from "@/components/ui/toast";
import { type InstalledExtension, runtime } from "../runtime";
import { type Extension, hasUpdate } from "../utils/extension";
import { toExtensions } from "../utils/registry";
import { fetchIndex } from "../utils/repo";
import { repos$ } from "./repos";

/** Catalog of the added repos merged with what the runtime has installed. */
export const extensions$ = observable<Extension[]>([]);

/** What the native runtime has installed; the one list the source picker reads. */
export const installed$ = observable<InstalledExtension[]>([]);

/** Whether `installed$` has been read from the runtime at least once. */
export const installedLoaded$ = observable(false);

/** Reads the installed list from the runtime; a failure is logged, keeps the old list and still counts as loaded. */
export async function refreshInstalled(): Promise<void> {
  try {
    installed$.set(await runtime.installed());
    installedLoaded$.set(true);
  } catch (error) {
    console.warn("Couldn't read installed extensions", error);
    // Otherwise a screen waiting on the list would load forever.
    installedLoaded$.set(true);
  }
}

const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

let latest = 0;

export async function loadExtensions(): Promise<void> {
  const mine = ++latest;
  const installed = await runtime.installed().catch((error) => {
    toast.destructive(message(error));
    return undefined;
  });
  const repos = await Promise.all(
    repos$.peek().map(async (repo) => {
      try {
        return { repo, entries: await fetchIndex(repo) };
      } catch {
        toast.destructive(`Couldn't load ${repo.name}`);
        return { repo, entries: [] };
      }
    }),
  );
  // A slower, older load must not overwrite a newer one.
  if (mine !== latest) return;
  if (installed) {
    installed$.set(installed);
    installedLoaded$.set(true);
  }
  try {
    extensions$.set(toExtensions(repos, installed ?? installed$.peek()));
  } catch (error) {
    // A malformed entry keeps the previous list instead of rejecting unseen.
    toast.destructive(message(error));
  }
}

const running = new Set<string>();

// Never rejects: the buttons call these without awaiting. One run per id at a time.
async function perform(
  id: string,
  task: (e: Extension) => Promise<unknown>,
): Promise<boolean> {
  if (running.has(id)) return false;
  running.add(id);
  try {
    const extension = extensions$.peek().find((e) => e.id === id);
    if (!extension) throw new Error("Extension not found");
    await task(extension);
    return true;
  } catch (error) {
    toast.destructive(message(error));
    return false;
  } finally {
    running.delete(id);
  }
}

async function run(id: string, task: (e: Extension) => Promise<unknown>) {
  if (await perform(id, task)) await loadExtensions();
}

const download = (e: Extension) => {
  if (!e.apkUrl || !e.signingKey)
    throw new Error(`No repo lists ${e.name} to download`);
  return runtime.install(e.apkUrl, e.signingKey);
};

export const installExtension = (id: string) => run(id, download);

export const updateExtension = (id: string) => run(id, download);

export const uninstallExtension = (id: string) =>
  run(id, (e) => runtime.uninstall(e.id));

// One after another (each takes the native install lock), then a single reload.
export async function updateAllExtensions() {
  let changed = false;
  for (const e of extensions$.peek().filter(hasUpdate)) {
    if (await perform(e.id, download)) changed = true;
  }
  if (changed) await loadExtensions();
}

export const checkForUpdates = loadExtensions;
