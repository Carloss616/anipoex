import type { Observable, ObservablePrimitive } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { RefreshControl, useWindowDimensions } from "react-native";
import { EmptyState } from "@/components/empty-state";
import { Center } from "@/components/layout/center";
import { LegendList } from "@/components/layout/legend-list";
import { Spinner } from "@/components/ui/spinner";
import { useMangaList } from "@/features/manga/hooks/use-manga-list";
import type { MediaListStatus } from "@/graphql/types";
import { useRefreshControlTheme } from "@/hooks/use-theme";
import { ListEmpty } from "./list-empty";
import { ListHeader } from "./list-header";
import { ListItem } from "./list-item";

export function ListScene({
  status,
  query$,
  counts$,
}: {
  status: MediaListStatus;
  query$: ObservablePrimitive<string>;
  counts$: Observable<Record<MediaListStatus, number | null>>;
}) {
  const { width } = useWindowDimensions();
  const { manga$, genres$, genre$, isPending, isRefetching, refetch, error } =
    useMangaList(status, query$, counts$);
  const refreshControlTheme = useRefreshControlTheme();
  const manga = useValue(manga$);

  const numColumns =
    width >= 1280 ? 12 : width >= 1024 ? 8 : width >= 768 ? 6 : 4;

  if (isPending) {
    return (
      <Center>
        <Spinner size="lg" />
      </Center>
    );
  }

  if (error && !manga?.length) {
    return (
      <EmptyState
        title="Couldn't load this list"
        description={error instanceof Error ? error.message : String(error)}
      />
    );
  }

  return (
    <LegendList
      recycleItems
      data={manga}
      numColumns={numColumns}
      keyExtractor={(item) => item.id}
      columnWrapperStyle={{ gap: 2 }}
      contentContainerClassName="gutters px-safe-offset-gx pb-safe-offset-gb"
      ListHeaderComponentClassName="gutters mx-bleed-safe-gx"
      ListHeaderComponent={<ListHeader genre$={genre$} genres$={genres$} />}
      renderItem={({ item }) => <ListItem item={item} />}
      ListEmptyComponent={<ListEmpty genre$={genre$} query$={query$} />}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          {...refreshControlTheme}
        />
      }
    />
  );
}
