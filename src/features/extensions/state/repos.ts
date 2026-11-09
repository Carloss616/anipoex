import { settings$ } from "@/state/settings";
import type { Repo } from "../utils/repo";

export const addRepo = (repo: Repo) => {
  if (
    settings$.extensions.repos.get().some((r) => r.indexUrl === repo.indexUrl)
  )
    return;
  settings$.extensions.repos.set((list) => [...list, repo]);
};

export const removeRepo = (indexUrl: string) => {
  settings$.extensions.repos.set((list) =>
    list.filter((r) => r.indexUrl !== indexUrl),
  );
};
