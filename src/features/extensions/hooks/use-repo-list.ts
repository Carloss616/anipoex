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
  const error$ = useObservable<string | undefined>(undefined);
  const fieldOpen$ = useObservable(repos$.peek().length === 0);
  // Under a plain root: a root computed freezes under Fast Refresh.
  const derived$ = useObservable({
    canAdd: () => !adding$.get() && url$.get().trim() !== "",
    filled: () => url$.get() !== "",
  });
  const [pending, setPending] = useState<Repo>();

  const add = async () => {
    const url = url$.peek();
    if (adding$.peek() || url.trim() === "") return;
    adding$.set(true);
    try {
      const repo = await fetchRepo(url);
      // Matched by what the URL resolves to: two URLs can name one repo.
      if (repos$.peek().some((r) => r.indexUrl === repo.indexUrl))
        toast.info(`${repo.name} is already added`);
      else setPending(repo);
    } catch (error) {
      error$.set(error instanceof Error ? error.message : String(error));
    } finally {
      adding$.set(false);
    }
  };

  const setUrl = (text: string) => {
    url$.set(text);
    error$.set(undefined);
  };

  const showField = (open: boolean) => {
    fieldOpen$.set(open);
    if (open) return;
    url$.set("");
    error$.set(undefined);
  };

  const trust = (repo: Repo) => {
    addRepo(repo);
    showField(false);
    void loadExtensions();
  };

  const remove = (repo: Repo) => {
    removeRepo(repo.indexUrl);
    if (repos$.peek().length === 0) showField(true);
    void loadExtensions();
  };

  return {
    repos,
    url$,
    setUrl,
    clear: () => setUrl(""),
    canAdd$: derived$.canAdd,
    filled$: derived$.filled,
    error$,
    fieldOpen$,
    toggleField: () => showField(!fieldOpen$.peek()),
    add,
    pending,
    dismiss: () => setPending(undefined),
    trust,
    remove,
  };
}
