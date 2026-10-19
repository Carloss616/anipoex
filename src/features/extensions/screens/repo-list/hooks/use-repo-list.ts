import { useValue } from "@legendapp/state/react";
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
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);
  // The repo fetched and waiting for the user to trust it.
  const [pending, setPending] = useState<Repo>();

  const add = async () => {
    if (adding || url.trim() === "") return;
    setAdding(true);
    try {
      setPending(await fetchRepo(url));
    } catch (error) {
      toast.destructive(error instanceof Error ? error.message : String(error));
    } finally {
      setAdding(false);
    }
  };

  const trust = (repo: Repo) => {
    addRepo(repo);
    setUrl("");
    void loadExtensions();
  };

  const remove = (repo: Repo) => {
    removeRepo(repo.indexUrl);
    void loadExtensions();
  };

  return {
    repos,
    url,
    setUrl,
    adding,
    canAdd: !adding && url.trim() !== "",
    add,
    pending,
    dismiss: () => setPending(undefined),
    trust,
    remove,
  };
}
