import { useHeaderHeight } from "expo-router/react-navigation";
import { Platform } from "react-native";
import { Host } from "@/components/ui/host";
import { MangaGrid } from "@/features/manga/components/manga-grid";
import { searchTitle } from "@/features/manga/utils/search-params";
import { SearchEmpty } from "./components/search-empty";
import { SearchFilters } from "./components/search-filters";
import { SearchHeader } from "./components/search-header";
import { useSearchRoute } from "./hooks/use-search-route";

/** The grid and its filters are SwiftUI / Compose, in one Host. */
export function MangaSearch() {
  const { params, search, update, submit } = useSearchRoute();
  const headerHeight = useHeaderHeight();

  return (
    <>
      <SearchHeader
        title={searchTitle(params)}
        query={params.q}
        onSubmit={submit}
      />
      <Host
        className="flex-1"
        // Android's header draws over the screen; iOS insets content itself.
        style={
          Platform.OS === "android" ? { marginTop: headerHeight } : undefined
        }
      >
        <MangaGrid
          manga$={search.manga$}
          loading={search.loading}
          empty={
            <SearchEmpty
              params={params}
              error={search.error}
              onRetry={() => void search.refetch().catch(() => {})}
            />
          }
          header={<SearchFilters params={params} onChange={update} />}
          onEndReached={search.hasMore ? search.loadMore : undefined}
        />
      </Host>
    </>
  );
}
