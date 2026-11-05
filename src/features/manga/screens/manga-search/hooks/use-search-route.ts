import { useLocalSearchParams, useRouter } from "expo-router";
import { useMangaSearch } from "@/features/manga/hooks/use-manga-search";
import { rememberSearch } from "@/features/manga/state/search-history";
import {
  parseSearchParams,
  type SearchParams,
  toSetParams,
} from "@/features/manga/utils/search-params";

/** The search lives in the URL: every change replaces its params. */
export function useSearchRoute() {
  const router = useRouter();
  const params = parseSearchParams(useLocalSearchParams());
  const search = useMangaSearch(params);

  const update = (next: SearchParams) => router.setParams(toSetParams(next));

  const submit = (text: string) => {
    const q = text.trim();
    if (!q) return;
    rememberSearch(q);
    update({ ...params, q });
  };

  return { params, search, update, submit };
}
