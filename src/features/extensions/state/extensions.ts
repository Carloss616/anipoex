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

export type ExtensionOperation = "installing" | "updating" | "uninstalling";

/** The in-flight operation for each extension, used to replace its action with progress. */
export const extensionOperations$ = observable<
  Record<string, ExtensionOperation | undefined>
>({});

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

// Never rejects: the buttons call these without awaiting.
async function perform(
  id: string,
  task: (e: Extension) => Promise<unknown>,
): Promise<boolean> {
  try {
    const extension = extensions$.peek().find((e) => e.id === id);
    if (!extension) throw new Error("Extension not found");
    await task(extension);
    return true;
  } catch (error) {
    toast.destructive(message(error));
    return false;
  }
}

// One at a time (native install lock), one reload; rows show progress until it lands, so no stale action flashes back.
async function run(
  ids: string[],
  operation: ExtensionOperation,
  task: (e: Extension) => Promise<unknown>,
) {
  const mine = ids.filter((id) => !extensionOperations$[id].peek());
  for (const id of mine) extensionOperations$[id].set(operation);
  try {
    let changed = false;
    for (const id of mine) if (await perform(id, task)) changed = true;
    if (changed) await loadExtensions();
  } finally {
    for (const id of mine) extensionOperations$[id].delete();
  }
}

const download = (e: Extension) => {
  if (!e.apkUrl || !e.signingKey)
    throw new Error(`No repo lists ${e.name} to download`);
  return runtime.install(e.apkUrl, e.signingKey);
};

export const installExtension = (id: string) =>
  run([id], "installing", download);

export const updateExtension = (id: string) => run([id], "updating", download);

export const uninstallExtension = (id: string) =>
  run([id], "uninstalling", (e) => runtime.uninstall(e.id));

export const updateAllExtensions = () =>
  run(
    extensions$
      .peek()
      .filter(hasUpdate)
      .map((e) => e.id),
    "updating",
    download,
  );

export const checkForUpdates = loadExtensions;
