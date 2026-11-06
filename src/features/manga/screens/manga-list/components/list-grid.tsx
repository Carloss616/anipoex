import { useApolloClient } from "@apollo/client/react";
import type { ObservablePrimitive } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import type { ReactElement } from "react";
import { Platform } from "react-native";
import { MangaGrid } from "@/features/manga/components/manga-grid";
import type { MangaListState } from "@/features/manga/hooks/use-manga-list";
import { ListEmpty } from "./list-empty";

/** The grid for one list; the caller owns the data (`useMangaList`). */
export function ListGrid({
  list,
  query$,
  genre$,
  header,
}: {
  list: MangaListState;
  query$: ObservablePrimitive<string>;
  genre$: ObservablePrimitive<string>;
  /** Scrolls with the grid, above it (the genre and view controls). */
  header?: ReactElement;
}) {
  const client = useApolloClient();
  const genre = useValue(genre$);

  return (
    <MangaGrid
      className="gutters px-gx pb-gb md:pl-4"
      manga$={list.manga$}
      loading={list.loading && !list.refetching}
      empty={<ListEmpty genre$={genre$} query$={query$} />}
      header={header}
      // Android's lazy column keeps its scroll across filters; others animate.
      scrollKey={Platform.OS === "android" ? genre : undefined}
      refreshing={list.refetching}
      onRefresh={() =>
        Promise.all([
          list.refetch(),
          client.refetchQueries({ include: ["MangaListCounts"] }),
        ])
      }
    />
  );
}
