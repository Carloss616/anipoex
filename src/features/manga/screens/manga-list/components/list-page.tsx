import type { Observable, ObservablePrimitive } from "@legendapp/state";
import {
  type MangaListStore,
  useMangaList,
} from "@/features/manga/hooks/use-manga-list";
import type { ListKey } from "@/features/manga/utils/parse-list";
import { ListGrid } from "./list-grid";
import { ListHeader } from "./list-header";

/** A pager page; its list state is the screen's, so the toolbar can read it. */
export function ListPage({
  status,
  query$,
  list$,
}: {
  status: ListKey;
  query$: ObservablePrimitive<string>;
  list$: Observable<MangaListStore>;
}) {
  const list = useMangaList(status, query$, list$);

  return (
    <ListGrid
      list={list}
      query$={query$}
      genre$={list$.genre}
      header={<ListHeader genre$={list$.genre} list={list} />}
    />
  );
}
