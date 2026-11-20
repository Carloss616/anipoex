import { Button, HStack, List, Section, VStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  clipShape,
  foregroundStyle,
  frame,
  lineLimit,
  listRowBackground,
  listStyle,
  scrollContentBackground,
  scrollDismissesKeyboard,
} from "@expo/ui/swift-ui/modifiers";
import { EmptyState } from "@/components/blocks/empty-state";
import { LoadingState } from "@/components/blocks/loading-state";
import { SuggestionsOverlay } from "@/components/layout/suggestions-overlay";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Image } from "@/components/native/swift-ui/image";
import { Text } from "@/components/native/swift-ui/text";
import { Host } from "@/components/ui/host";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useLibraryMatches } from "../../hooks/use-library-matches";
import { libraryDetail } from "../../utils/library-detail";
import type { LibraryMatchesProps } from "./library-matches";

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
  const rowBackground = listRowBackground(useThemeColor("surface-secondary"));
  if (loading) return <LoadingState />;
  if (matches.length === 0)
    return <EmptyState title="No manga in your lists match" />;

  return (
    <Host className="flex-1">
      <List
        modifiers={[
          listStyle("insetGrouped"),
          scrollContentBackground("hidden"),
          scrollDismissesKeyboard("immediately"),
        ]}
      >
        <Section
          modifiers={[rowBackground]}
          header={<Text>In your library</Text>}
        >
          {matches.map((manga) => (
            <Button
              key={manga.id}
              onPress={() => onPick(manga.id)}
              modifiers={[buttonStyle("plain")]}
            >
              <HStack spacing={12} modifiers={ROW_FILL}>
                {manga.coverImage?.medium ? (
                  <Image
                    source={{ uri: manga.coverImage.medium }}
                    modifiers={[
                      frame({ width: 28, height: 40 }),
                      clipShape("roundedRectangle", 5),
                    ]}
                  />
                ) : null}
                <VStack alignment="leading" spacing={2}>
                  <Text modifiers={[lineLimit(1)]}>
                    {manga.title?.userPreferred ?? ""}
                  </Text>
                  <Text
                    textStyle="subheadline"
                    modifiers={[foregroundStyle("secondary")]}
                  >
                    {libraryDetail(manga)}
                  </Text>
                </VStack>
              </HStack>
            </Button>
          ))}
        </Section>
      </List>
    </Host>
  );
}
