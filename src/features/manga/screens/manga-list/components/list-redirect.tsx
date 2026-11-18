import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useCustomLists } from "@/features/manga/hooks/use-manga-list-counts";
import { type ListKey, resolveList } from "@/features/manga/utils/parse-list";

/**
 * Opens Reading in place of a custom list the account no longer has. Its own
 * component, so a count changing redraws only this.
 */
export function ListRedirect({ list }: { list: ListKey }) {
  const router = useRouter();
  const lists = useCustomLists();
  const resolved = resolveList(list, lists?.map((l) => l.name) ?? null);

  useEffect(() => {
    if (resolved !== list) router.setParams({ list: resolved });
  }, [list, resolved, router]);

  return null;
}
