import { Button, HStack, List, Section, VStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  clipShape,
  foregroundStyle,
  frame,
  lineLimit,
  listStyle,
  scrollDismissesKeyboard,
} from "@expo/ui/swift-ui/modifiers";
import { EmptyState } from "@/components/blocks/empty-state";
import { LoadingState } from "@/components/blocks/loading-state";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Image } from "@/components/native/swift-ui/image";
import { Text } from "@/components/native/swift-ui/text";
import { Host } from "@/components/ui/host";
import { useLibraryMatches } from "../../hooks/use-library-matches";
import { libraryDetail } from "../../utils/library-detail";
import type { LibraryMatchesProps } from "./library-matches";

/** The manga in your lists matching the search, in place of the activity. */
export function LibraryMatches({ query$, onPick }: LibraryMatchesProps) {
  const { matches, loading } = useLibraryMatches(query$);
  if (loading) return <LoadingState />;
  if (matches.length === 0)
    return <EmptyState title="No manga in your lists match" />;

  return (
    <Host className="flex-1">
      <List
        modifiers={[
          listStyle("insetGrouped"),
          scrollDismissesKeyboard("immediately"),
        ]}
      >
        <Section header={<Text>In your library</Text>}>
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
