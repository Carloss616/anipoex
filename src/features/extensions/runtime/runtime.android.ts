import { requireNativeModule } from "expo";
import type { RuntimeApi } from "./runtime";
import { type FilePage, localPages } from "./utils/local-pages";
import { nativeErrorMessage } from "./utils/native-error";

const native = requireNativeModule<
  Omit<
    RuntimeApi,
    "pageImage" | "stagePage" | "pack" | "unpack" | "unpacked"
  > & {
    stagePage(
      sourceId: string,
      imageUrl: string,
      index: number,
      stage: string,
      name: string,
    ): Promise<void>;
    pack(stage: string, comicInfo: string): Promise<{ uri: string }>;
    unpack(uri: string, key: string): Promise<FilePage[]>;
    unpacked(key: string): Promise<FilePage[] | null>;
    image(
      sourceId: string,
      imageUrl: string,
      index: number,
    ): Promise<{ uri: string }>;
  }
>("ExtensionRuntime");

// Toasts and empty states show the cause's message, not the bridge's wrapper.
const clean = <T>(promise: Promise<T>): Promise<T> =>
  promise.catch((error: unknown) => {
    throw new Error(nativeErrorMessage(error));
  });

/** Android runs the extension APKs; the fallback in `runtime.ts` does not. */
export const isRuntimeAvailable: boolean = true;

export const runtime: RuntimeApi = {
  install: (apkUrl, signingKey) => clean(native.install(apkUrl, signingKey)),
  installed: () => clean(native.installed()),
  uninstall: (pkg) => clean(native.uninstall(pkg)),
  search: (sourceId, query, page) =>
    clean(native.search(sourceId, query, page)),
  chapters: (sourceId, mangaUrl, title, memo) =>
    clean(native.chapters(sourceId, mangaUrl, title, memo)),
  mangaWebUrl: (sourceId, mangaUrl) =>
    clean(native.mangaWebUrl(sourceId, mangaUrl)),
  pages: (sourceId, chapterUrl, memo) =>
    clean(native.pages(sourceId, chapterUrl, memo)),
  pageImage: async (sourceId, page) =>
    (await clean(native.image(sourceId, page.imageUrl, page.index))).uri,
  stagePage: (sourceId, page, stage, name) =>
    clean(native.stagePage(sourceId, page.imageUrl, page.index, stage, name)),
  pack: async (stage, comicInfo) =>
    (await clean(native.pack(stage, comicInfo))).uri,
  dropStage: (stage) => clean(native.dropStage(stage)),
  unpack: async (uri, key) => localPages(await clean(native.unpack(uri, key))),
  unpacked: async (key) => {
    const pages = await clean(native.unpacked(key));
    return pages && localPages(pages);
  },
  getDns: () => clean(native.getDns()),
  setDns: (dns) => clean(native.setDns(dns)),
  challengedHosts: () => clean(native.challengedHosts()),
};
