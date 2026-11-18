import { useApolloClient } from "@apollo/client/react";
import type { ObservablePrimitive } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import type { ReactElement } from "react";
import { Platform } from "react-native";
import { loadDownloaded } from "@/features/downloads";
import { MangaGrid } from "@/features/manga/components/manga-grid";
import type { MangaListState } from "@/features/manga/hooks/use-manga-list";
import type { useScrollSync } from "@/hooks/use-scroll-sync";
import { noop } from "@/utils/utils";
import { ListEmpty } from "./list-empty";

/** The grid for one list; the caller owns the data (`useMangaList`). */
export function ListGrid({
  list,
  query$,
  genre$,
  header,
  covered,
  scrollSync,
}: {
  list: MangaListState;
  query$: ObservablePrimitive<string>;
  genre$: ObservablePrimitive<string>;
  /** Scrolls with the grid, above it (the genre and view controls). */
  header?: ReactElement;
  /**
   * A sheet route is over the screen: the grid stays drawn under it.
   * @platform web
   */
  covered?: boolean;
  /**
   * Scrolls together with the sidebar.
   * @platform web
   */
  scrollSync?: ReturnType<typeof useScrollSync>;
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
      visibleWhenBlurred={covered}
      scrollSync={scrollSync}
      // Android's lazy column keeps its scroll across filters; others animate.
      scrollKey={Platform.OS === "android" ? genre : undefined}
      refreshing={list.refetching}
      onRefresh={() => {
        // Not awaited: a picked folder walks its whole tree per manga.
        loadDownloaded().catch(noop);
        return Promise.all([
          list.refetch(),
          client.refetchQueries({ include: ["MangaListCounts"] }),
        ]);
      }}
    />
  );
}
