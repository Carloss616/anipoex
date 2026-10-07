import type { ObservablePrimitive } from "@legendapp/state";
import { useObservable } from "@legendapp/state/react";
import { ALL, useMangaList } from "@/features/manga/hooks/use-manga-list";
import type { MediaListStatus } from "@/graphql/types.generated";
import { ListHeader } from "./list-header";
import { ListScene } from "./list-scene";

/** One page of a pager: its own genre, its own query. */
export function ListPage({
  status,
  query$,
}: {
  status: MediaListStatus;
  query$: ObservablePrimitive<string>;
}) {
  const genre$ = useObservable(ALL);
  const list = useMangaList(status, query$, genre$);

  return (
    <ListScene
      list={list}
      query$={query$}
      genre$={genre$}
      header={<ListHeader genre$={genre$} genres$={list.genres$} />}
    />
  );
}
