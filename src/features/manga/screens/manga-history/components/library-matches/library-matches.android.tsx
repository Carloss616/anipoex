import { Box, LazyColumn } from "@expo/ui/jetpack-compose";
import {
  clip,
  fillMaxSize,
  padding,
  Shapes,
  size,
} from "@expo/ui/jetpack-compose/modifiers";
import { useHeaderHeight } from "expo-router/react-navigation";
import { EmptyState } from "@/components/blocks/empty-state";
import { LoadingState } from "@/components/blocks/loading-state";
import { GUTTER } from "@/components/native/constants";
import { Image } from "@/components/native/jetpack-compose/image";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Host } from "@/components/ui/host";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { useLibraryMatches } from "../../hooks/use-library-matches";
import { libraryDetail } from "../../utils/library-detail";
import type { LibraryMatchesProps } from "./library-matches";

/** The manga in your lists matching the search, in place of the activity. */
export function LibraryMatches({ query$, onPick }: LibraryMatchesProps) {
  const { matches, loading } = useLibraryMatches(query$);
  const headerHeight = useHeaderHeight();
  const m3 = useThemeM3Colors();
  if (loading) return <LoadingState />;
  if (matches.length === 0)
    return <EmptyState title="No manga in your lists match" />;

  return (
    <Host className="flex-1" style={{ marginTop: headerHeight }}>
      <LazyColumn modifiers={[fillMaxSize()]}>
        <Text
          style={{ typography: "titleSmall" }}
          color={m3.primary}
          modifiers={[padding(GUTTER, 16, GUTTER, 8)]}
        >
          In your library
        </Text>
        {matches.map((manga, index) => (
          <Box
            key={manga.id}
            modifiers={[
              padding(GUTTER, index > 0 ? SEGMENTED_GAP : 0, GUTTER, 0),
            ]}
          >
            <SegmentedListItem
              index={index}
              count={matches.length}
              colors={{ containerColor: m3.surfaceContainer }}
              onPress={() => onPick(manga.id)}
            >
              <SegmentedListItem.Leading>
                {manga.coverImage?.medium ? (
                  <Image
                    source={{ uri: manga.coverImage.medium }}
                    modifiers={[size(28, 40), clip(Shapes.RoundedCorner(6))]}
                  />
                ) : (
                  <Box modifiers={[size(28, 40)]} />
                )}
              </SegmentedListItem.Leading>
              <Text maxLines={1} overflow="ellipsis">
                {manga.title?.userPreferred ?? ""}
              </Text>
              <SegmentedListItem.Supporting>
                <Text style={{ typography: "bodyMedium" }}>
                  {libraryDetail(manga)}
                </Text>
              </SegmentedListItem.Supporting>
            </SegmentedListItem>
          </Box>
        ))}
      </LazyColumn>
    </Host>
  );
}
