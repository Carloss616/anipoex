import type { MenuAction } from "@/components/ui/menu";
import {
  searchTitles,
  uniqueTitles,
} from "@/features/manga/utils/source-match";
import type { MangaDetail } from "@/features/manga/utils/to-detail";

/**
 * AniList titles, then synonyms, then the manual matches' titles, each once;
 * the one searched is checked.
 */
export const titleMenuItems = (
  manga: Pick<MangaDetail, "title" | "synonyms">,
  query: string,
  submit: (title: string) => void,
  aliases: string[] = [],
): MenuAction[] =>
  uniqueTitles(searchTitles(manga, aliases).all).map((title) => ({
    label: title,
    checked: title === query,
    onPress: () => submit(title),
  }));
