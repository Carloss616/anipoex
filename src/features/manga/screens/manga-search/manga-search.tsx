import { HeaderInsetView } from "@/components/layout/header-inset-view";
import { MangaGrid } from "@/features/manga/components/manga-grid";
import { SearchEmpty } from "./components/search-empty";
import { SearchFilters } from "./components/search-filters";
import { SearchHeader } from "./components/search-header";
import { useSearchRoute } from "./hooks/use-search-route";

/** AniList's manga for the URL's search, filters above the grid. */
export function MangaSearch() {
  const { params, search, update, submit } = useSearchRoute();

  return (
    <>
      <SearchHeader query={params.q} onSubmit={submit} />
      <MangaGrid
        className="gutters px-gx pb-gb"
        manga$={search.manga$}
        loading={search.loading}
        empty={
          <SearchEmpty
            params={params}
            error={search.error}
            onRetry={() => void search.refetch().catch(() => {})}
          />
        }
        header={
          <HeaderInsetView>
            <SearchFilters params={params} onChange={update} />
          </HeaderInsetView>
        }
        onEndReached={search.hasMore ? search.loadMore : undefined}
      />
    </>
  );
}
