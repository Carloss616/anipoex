import type { ObservablePrimitive } from "@legendapp/state";
import { Image } from "expo-image";
import { cn } from "panelui-native/utils/cn";
import { Frame } from "panelui-web/frame";
import { ScrollView } from "react-native";
import { EmptyState } from "@/components/blocks/empty-state";
import { LoadingState } from "@/components/blocks/loading-state";
import { HeaderInsetView } from "@/components/layout/header-inset-view";
import { SuggestionsOverlay } from "@/components/layout/suggestions-overlay";
import { COVER_ROUNDED } from "@/features/manga/components/manga-card";
import { useLibraryMatches } from "../../hooks/use-library-matches";
import { libraryDetail } from "../../utils/library-detail";

export interface LibraryMatchesProps {
  query$: ObservablePrimitive<string>;
  onPick: (mediaId: number) => void;
}

/**
 * The manga in your lists matching the search; it fades in over the
 * activity while the search has text.
 */
export function LibraryMatches(props: LibraryMatchesProps) {
  return (
    <SuggestionsOverlay>
      <Matches {...props} />
    </SuggestionsOverlay>
  );
}

function Matches({ query$, onPick }: LibraryMatchesProps) {
  const { matches, loading } = useLibraryMatches(query$);
  if (loading) return <LoadingState />;
  if (matches.length === 0)
    return <EmptyState title="No manga in your lists match" />;

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <HeaderInsetView className="gutters px-gx pb-gb pt-4">
        <Frame>
          <Frame.Header>
            <Frame.Title>In your library</Frame.Title>
          </Frame.Header>
          <Frame.Panel>
            {matches.map((manga) => (
              <Frame.Row key={manga.id} onClick={() => onPick(manga.id)}>
                <Frame.Media>
                  <Image
                    source={manga.coverImage?.medium}
                    contentFit="cover"
                    className={cn("aspect-2/3 w-8", COVER_ROUNDED)}
                    style={{
                      backgroundColor: manga.coverImage?.color ?? undefined,
                    }}
                  />
                </Frame.Media>
                <Frame.Content>
                  <Frame.Title as="p">{manga.title?.userPreferred}</Frame.Title>
                  <Frame.Description>{libraryDetail(manga)}</Frame.Description>
                </Frame.Content>
              </Frame.Row>
            ))}
          </Frame.Panel>
        </Frame>
      </HeaderInsetView>
    </ScrollView>
  );
}
