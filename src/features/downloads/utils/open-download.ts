import type { RuntimeApi } from "@/features/extensions";
import { runtime } from "@/features/extensions/runtime";
import { settings$ } from "@/state/settings";
import { downloadRoot } from "./download-root";
import { type DownloadStore, downloadStore } from "./download-store";
import { NotDownloadedError } from "./download-store/utils/errors";
import { chapterHash, downloadKey, stageId } from "./paths";

type Pages = Awaited<ReturnType<RuntimeApi["pages"]>>;

interface OpenDeps {
  runtime: Pick<RuntimeApi, "unpack">;
  stores: () => DownloadStore[];
}

/** The current root, then the device's when the current one is a folder. */
function defaultStores() {
  const root = downloadRoot(settings$.device.peek());
  const roots = root.kind === "device" ? [root] : [root, { kind: "device" }];
  return roots
    .map((r) => downloadStore(r as typeof root))
    .filter((store): store is DownloadStore => !!store);
}

/** Downloaded pages, else undefined; the current root first, then the device's. */
export async function openDownload(
  mangaId: number,
  sourceId: string,
  chapterUrl: string,
  deps: OpenDeps = { runtime, stores: defaultStores },
): Promise<Pages | undefined> {
  const hash = chapterHash(chapterUrl);
  for (const store of deps.stores()) {
    const entry = (await store.list(mangaId, sourceId)).find(
      (e) => e.hash === hash,
    );
    if (!entry) continue;
    return deps.runtime.unpack(
      await store.get(entry.paths[0]),
      stageId(downloadKey(mangaId, sourceId, hash)),
    );
  }
  return undefined;
}

/** openDownload, falling back to runtime.pages when it isn't downloaded or can't be opened online. */
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
