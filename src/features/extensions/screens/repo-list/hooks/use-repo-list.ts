import { useObservable, useValue } from "@legendapp/state/react";
import { useState } from "react";
import { toast } from "@/components/ui/toast";
import {
  addRepo,
  fetchRepo,
  loadExtensions,
  type Repo,
  removeRepo,
  repos$,
} from "@/features/extensions";

export function useRepoList() {
  const repos = useValue(repos$);
  const url$ = useObservable("");
  const adding$ = useObservable(false);
  // Under a plain root: a root computed freezes under Fast Refresh.
  const derived$ = useObservable({
    canAdd: () => !adding$.get() && url$.get().trim() !== "",
  });
  // The repo fetched and waiting for the user to trust it.
  const [pending, setPending] = useState<Repo>();

  const add = async () => {
    const url = url$.peek();
    if (adding$.peek() || url.trim() === "") return;
    adding$.set(true);
    try {
      setPending(await fetchRepo(url));
    } catch (error) {
      toast.destructive(error instanceof Error ? error.message : String(error));
    } finally {
      adding$.set(false);
    }
  };

  const trust = (repo: Repo) => {
    addRepo(repo);
    url$.set("");
    void loadExtensions();
  };

  const remove = (repo: Repo) => {
    removeRepo(repo.indexUrl);
    void loadExtensions();
  };

  return {
    repos,
    url$,
    setUrl: (text: string) => url$.set(text),
    canAdd$: derived$.canAdd,
    add,
    pending,
    dismiss: () => setPending(undefined),
    trust,
    remove,
  };
}
