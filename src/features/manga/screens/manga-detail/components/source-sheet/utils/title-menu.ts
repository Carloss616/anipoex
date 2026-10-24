import type { MenuAction } from "@/components/ui/menu";
import {
  searchTitles,
  uniqueTitles,
} from "@/features/manga/utils/source-match";
import type { MangaDetail } from "@/features/manga/utils/to-detail";

/** The manga's AniList titles, then its synonyms, each once; the one searched is checked. */
export const titleMenuItems = (
  manga: Pick<MangaDetail, "title" | "synonyms">,
  query: string,
  submit: (title: string) => void,
): MenuAction[] =>
  uniqueTitles(searchTitles(manga).all).map((title) => ({
    label: title,
    checked: title === query,
    onPress: () => submit(title),
  }));
