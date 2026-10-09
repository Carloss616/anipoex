import type { Observable, ObservablePrimitive } from "@legendapp/state";
import {
  type MangaListStore,
  useMangaList,
} from "@/features/manga/hooks/use-manga-list";
import type { MediaListStatus } from "@/graphql/types.generated";
import { ListGrid } from "./list-grid";
import { ListHeader } from "./list-header";

/** One page of a pager; its list state is the screen's, so the toolbar can read it. */
export function ListPage({
  status,
  query$,
  list$,
}: {
  status: MediaListStatus;
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
