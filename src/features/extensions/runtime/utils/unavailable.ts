import type { RuntimeApi } from "../runtime";

const UNAVAILABLE = "Extensions run in the Android, iOS and desktop apps.";

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
