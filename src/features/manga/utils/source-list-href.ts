import type { Href } from "expo-router";

const PATH = /^\/manga\/(\d+)\/sources$/;

/** The manga's source list; `expanded` opens it at its full height. */
export const sourceListHref = (
  mangaId: number | string,
  expanded?: boolean,
): Href => ({
  pathname: "/manga/[id]/sources",
  params: { id: String(mangaId), ...(expanded && { expanded: "1" }) },
});

/** The manga whose source list `pathname` shows, if any. */
export function sourceListMangaId(pathname: string) {
  const id = PATH.exec(pathname)?.[1];
  return id ? Number(id) : null;
}
