import type { Observable, ObservablePrimitive } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import {
  type UseBreakpointResult,
  useBreakpoint,
} from "panelui-native/hooks/use-breakpoint";
import { RefreshControl } from "react-native";
import { Center } from "@/components/layout/center";
import { LegendList } from "@/components/layout/legend-list";
import { Loader } from "@/components/ui/loader";
import { useMangaList } from "@/features/manga/hooks/use-manga-list";
import type { MediaListStatus } from "@/graphql/types.generated";
import { useRefreshControlTheme } from "@/hooks/use-theme";
import { ListEmpty } from "./list-empty";
import { ListHeader } from "./list-header";
import { ListItem } from "./list-item";

const COLUMNS = {
  base: 4,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
} as const satisfies Record<UseBreakpointResult["current"], number>;

export function ListScene({
  status,
  query$,
  counts$,
}: {
  status: MediaListStatus;
  query$: ObservablePrimitive<string>;
  counts$: Observable<Record<MediaListStatus, number | null>>;
}) {
  const { current } = useBreakpoint();
  const { manga$, genres$, genre$, loading, refetching, refetch } =
    useMangaList(status, query$, counts$);
  const refreshControlTheme = useRefreshControlTheme();
  const manga = useValue(manga$);

  const numColumns = COLUMNS[current];

  if (loading && !refetching) {
    return (
      <Center>
        <Loader variant="morph-ring" speed={3} size="lg" />
      </Center>
    );
  }

  return (
    <LegendList
      recycleItems
      data={manga}
      numColumns={numColumns}
      keyExtractor={(item) => String(item.id)}
      columnWrapperStyle={{ gap: 2 }}
      contentContainerClassName="gutters px-safe-offset-gx pb-safe-offset-gb"
      ListHeaderComponentClassName="gutters mx-bleed-safe-gx"
      ListHeaderComponent={<ListHeader genre$={genre$} genres$={genres$} />}
      renderItem={({ item }) => <ListItem item={item} />}
      ListEmptyComponent={<ListEmpty genre$={genre$} query$={query$} />}
      refreshControl={
        <RefreshControl
          refreshing={refetching}
          onRefresh={refetch}
          {...refreshControlTheme}
        />
      }
    />
  );
}
