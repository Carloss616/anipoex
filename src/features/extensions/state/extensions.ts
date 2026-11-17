import { observable } from "@legendapp/state";
import { toast } from "@/components/ui/toast";
import { network$ } from "@/state/network";
import { settings$ } from "@/state/settings";
import { type InstalledExtension, runtime } from "../runtime";
import { type Extension, hasUpdate, keepUnchanged } from "../utils/extension";
import { toExtensions } from "../utils/registry";
import { fetchIndex, type Repo, type RepoEntry } from "../utils/repo";
import "./dns";
import { installs$ } from "./installs";

/** Catalog of the added repos merged with what the runtime has installed. */
export const extensions$ = observable<Extension[]>([]);

/** What the runtime has installed; the one list the source picker reads. */
export const installed$ = observable<InstalledExtension[]>([]);

/** Whether `installed$` has been read from the runtime at least once. */
export const installedLoaded$ = observable(false);

export type ExtensionOperation = "installing" | "updating" | "uninstalling";

/** Each extension's in-flight operation, shown as progress in its action. */
export const extensionOperations$ = observable<
  Record<string, ExtensionOperation | undefined>
>({});

/**
 * Reads the installed list from the runtime; a failure is logged, keeps the
 * old list and still counts as loaded.
 */
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

/** Every repo's index from the last load: a package may come from several. */
let indexes: { repo: Repo; entries: RepoEntry[] }[] = [];

export async function loadExtensions(): Promise<void> {
  const mine = ++latest;
  const installed = await runtime.installed().catch((error) => {
    toast.error(message(error));
    return undefined;
  });
  const repos = await Promise.all(
    settings$.extensions.repos.peek().map(async (repo) => {
      try {
        return { repo, entries: await fetchIndex(repo) };
      } catch {
        if (network$.online.peek()) toast.error(`Couldn't load ${repo.name}`);
        return { repo, entries: [] };
      }
    }),
  );
  // A slower, older load must not overwrite a newer one.
  if (mine !== latest) return;
  indexes = repos;
  if (installed) {
    installed$.set(installed);
    installedLoaded$.set(true);
  }
  try {
    extensions$.set(
      keepUnchanged(
        extensions$.peek(),
        toExtensions(repos, installed ?? installed$.peek()),
      ),
    );
  } catch (error) {
    // A malformed entry keeps the previous list instead of rejecting unseen.
    toast.error(message(error));
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
    toast.error(message(error));
    return false;
  }
}

/** What other devices learn from an operation that landed here. */
const keep: Partial<Record<ExtensionOperation, (e: Extension) => void>> = {
  installing: (e) => {
    if (!installs$[e.id].peek()) {
      installs$[e.id].set({ name: e.name, signingKey: e.signingKey });
    }
  },
  uninstalling: (e) => installs$[e.id].delete(),
};

// One at a time (native install lock), one reload; rows show progress until
// it lands, so no stale action flashes back. Resolves to the ids it did.
async function run(
  ids: string[],
  operation: ExtensionOperation,
  task: (e: Extension) => Promise<unknown>,
) {
  const mine = ids.filter((id) => !extensionOperations$[id].peek());
  for (const id of mine) extensionOperations$[id].set(operation);
  const done: string[] = [];
  try {
    for (const id of mine) {
      if (
        await perform(id, async (e) => {
          await task(e);
          keep[operation]?.(e);
        })
      )
        done.push(id);
    }
    if (done.length) await loadExtensions();
  } finally {
    for (const id of mine) extensionOperations$[id].delete();
  }
  return done;
}

const download = (e: Extension) => {
  if (!e.apkUrl || !e.signingKey)
    throw new Error(`No repo lists ${e.name} to download`);
  return runtime.install(e.apkUrl, e.signingKey);
};

export const installExtension = (id: string) =>
  run([id], "installing", download);

/**
 * Installs several in one queue, as a sync brings them, each from the repo
 * signed with its key when it has one; resolves to the ids done.
 */
export const installExtensions = (
  ids: string[],
  keys: Record<string, string | undefined> = {},
) =>
  run(ids, "installing", (e) => {
    const key = keys[e.id];
    if (!key) return download(e);
    const entry = indexes
      .find(({ repo }) => repo.signingKey === key)
      ?.entries.find((listed) => listed.pkg === e.id);
    if (!entry) throw new Error(`No repo signed with its key lists ${e.name}`);
    return runtime.install(entry.apkUrl, key);
  });

export const updateExtension = (id: string) => run([id], "updating", download);

const remove = (e: Extension) => runtime.uninstall(e.id);

export const uninstallExtension = (id: string) =>
  run([id], "uninstalling", remove);

/** Uninstalls several in one queue; resolves to the ids done. */
export const uninstallExtensions = (ids: string[]) =>
  run(ids, "uninstalling", remove);

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
