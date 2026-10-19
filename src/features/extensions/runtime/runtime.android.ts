import { requireNativeModule } from "expo";
import type { RuntimeApi } from "./runtime";

const native = requireNativeModule<RuntimeApi>("ExtensionRuntime");

/** Android runs the extension APKs; the fallback in `runtime.ts` does not. */
export const isRuntimeAvailable: boolean = true;

export const runtime: RuntimeApi = {
  install: (apkUrl, signingKey) => native.install(apkUrl, signingKey),
  installed: () => native.installed(),
  uninstall: (pkg) => native.uninstall(pkg),
  search: (sourceId, query, page) => native.search(sourceId, query, page),
  chapters: (sourceId, mangaUrl, title) =>
    native.chapters(sourceId, mangaUrl, title),
};
