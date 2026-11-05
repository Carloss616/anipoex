import { useObservable } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { rememberSearch } from "@/features/manga/state/search-history";

/**
 * Typing only fills `draft$`; a submit opens /search with it. Nothing reaches
 * AniList until then.
 */
export function useHomeSearch() {
  const router = useRouter();
  const draft$ = useObservable("");

  const submit = (text: string) => {
    const q = text.trim();
    if (!q) return;
    rememberSearch(q);
    draft$.set("");
    router.push({ pathname: "/search", params: { q } });
  };

  return { draft$, submit };
}
