import type { Href } from "expo-router";

const PATH = /^\/manga\/(\d+)\/sources$/;

/** The detail's route name in Home's and Manga's stacks. */
export const DETAIL_ROUTE = "manga/[id]/index";

/** The manga's source list; `expanded` opens it at its full height. */
export const sourceListHref = (
  mangaId: number | string,
  expanded?: boolean,
): Href => ({
  pathname: "/manga/[id]/sources",
  params: { id: String(mangaId), ...(expanded && { expanded: "1" }) },
});

/** Whether the stack has the manga's detail right under its list. */
export function isOverDetail(
  state: { routes: { name: string; params?: object }[]; index: number },
  mangaId: string,
) {
  const below = state.routes[state.index - 1];
  return (
    below?.name === DETAIL_ROUTE &&
    (below.params as { id?: string } | undefined)?.id === mangaId
  );
}

/** The manga whose source list `pathname` shows, if any. */
export function sourceListMangaId(pathname: string) {
  const id = PATH.exec(pathname)?.[1];
  return id ? Number(id) : null;
}
