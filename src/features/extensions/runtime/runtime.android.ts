import { requireNativeModule } from "expo";
import type { RuntimeApi } from "./runtime";
import { nativeErrorMessage } from "./utils/native-error";

const native = requireNativeModule<RuntimeApi>("ExtensionRuntime");

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
  chapters: (sourceId, mangaUrl, title) =>
    clean(native.chapters(sourceId, mangaUrl, title)),
  mangaWebUrl: (sourceId, mangaUrl) =>
    clean(native.mangaWebUrl(sourceId, mangaUrl)),
  pages: (sourceId, chapterUrl, memo) =>
    clean(native.pages(sourceId, chapterUrl, memo)),
};
