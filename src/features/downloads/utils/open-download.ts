import type { RuntimeApi } from "@/features/extensions";
import { runtime } from "@/features/extensions/runtime";
import { settings$ } from "@/state/settings";
import { type DownloadRoot, downloadRoot } from "./download-root";
import { type DownloadStore, downloadStore } from "./download-store";
import { NotDownloadedError } from "./download-store/utils/errors";
import { chapterHash, downloadKey, stageId } from "./paths";

type Pages = Awaited<ReturnType<RuntimeApi["pages"]>>;

interface OpenDeps {
  runtime: Pick<RuntimeApi, "unpack" | "unpacked">;
  stores: () => DownloadStore[];
}

/** The current root, then the device's when the current one is a folder. */
function defaultStores() {
  const root = downloadRoot(settings$.device.peek());
  const roots: DownloadRoot[] =
    root.kind === "device" ? [root] : [root, { kind: "device" }];
  return roots
    .map(downloadStore)
    .filter((store): store is DownloadStore => !!store);
}

/**
 * Downloaded pages, else undefined; the current root first, then the device's.
 * A cloud placeholder moves on to the next store; it only throws
 * NotDownloadedError when no store could open the chapter.
 */
export async function openDownload(
  mangaId: number,
  sourceId: string,
  chapterUrl: string,
  deps: OpenDeps = { runtime, stores: defaultStores },
): Promise<Pages | undefined> {
  const hash = chapterHash(chapterUrl);
  const key = stageId(downloadKey(mangaId, sourceId, hash));
  let cloud: NotDownloadedError | undefined;
  for (const store of deps.stores()) {
    const entry = (await store.list(mangaId, sourceId)).find(
      (e) => e.hash === hash,
    );
    if (!entry) continue;
    // Getting the file can copy a whole CBZ out of a bookmarked folder.
    const cached = await deps.runtime.unpacked(key);
    if (cached) return cached;
    let uri: string;
    try {
      uri = await store.get(entry.paths[0]);
    } catch (error) {
      if (!(error instanceof NotDownloadedError)) throw error;
      cloud = error;
      continue;
    }
    return deps.runtime.unpack(uri, key);
  }
  if (cloud) throw cloud;
  return undefined;
}

/**
 * openDownload, falling back to runtime.pages when it isn't downloaded or
 * can't be opened.
 */
export async function chapterPages(
  mangaId: number,
  sourceId: string,
  chapterUrl: string,
  memo: string | undefined,
  deps: OpenDeps & { pages: RuntimeApi["pages"] } = {
    runtime,
    stores: defaultStores,
    pages: (...args) => runtime.pages(...args),
  },
): Promise<Pages> {
  const fromSource = () => deps.pages(sourceId, chapterUrl, memo);
  let opened: Pages | undefined;
  try {
    opened = await openDownload(mangaId, sourceId, chapterUrl, deps);
  } catch (error) {
    if (!(error instanceof NotDownloadedError)) return fromSource();
    // An online device can still read it from the source.
    return fromSource().catch(() => {
      throw new Error(
        "This chapter is still in the cloud. Connect to download it.",
      );
    });
  }
  return opened ?? fromSource();
}
