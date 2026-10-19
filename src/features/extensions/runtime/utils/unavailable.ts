import type { RuntimeApi } from "../runtime";

const UNAVAILABLE = "Extensions run on Android only for now.";

const unavailable = (): Promise<never> =>
  Promise.reject(new Error(UNAVAILABLE));

/** What platforms without an extension runtime answer: nothing installed, every action refused. */
export const unavailableRuntime: RuntimeApi = {
  install: unavailable,
  installed: async () => [],
  uninstall: unavailable,
  search: unavailable,
  chapters: unavailable,
  mangaWebUrl: async () => null,
};
