import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersist } from "@/state/observable-persist";
import type { Repo } from "../utils/repo";

/** Repos the user installs extensions from; the app ships with none. */
export const repos$ = observable<Repo[]>([]);

/** A repo saved before stores had index urls was always a legacy repo.json one. */
export const storedRepo = (
  repo: Omit<Repo, "indexUrl" | "legacy"> & Partial<Repo>,
): Repo => ({
  indexUrl: `${repo.baseUrl}/repo.json`,
  legacy: true,
  ...repo,
});

syncObservable(repos$, {
  persist: {
    name: "extension-repos",
    plugin: ObservablePersist,
    transform: { load: (list: Repo[]) => list.map(storedRepo) },
  },
});

export const addRepo = (repo: Repo) => {
  if (repos$.get().some((r) => r.baseUrl === repo.baseUrl)) return;
  repos$.set((list) => [...list, repo]);
};

export const removeRepo = (baseUrl: string) => {
  repos$.set((list) => list.filter((r) => r.baseUrl !== baseUrl));
};
