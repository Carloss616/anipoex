import { Column, LazyColumn, Row, TextButton } from "@expo/ui/jetpack-compose";
import {
  fillMaxSize,
  padding,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { useHeaderHeight } from "expo-router/react-navigation";
import { GUTTER } from "@/components/native/constants";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Host } from "@/components/ui/host";
import { Icon, Icons } from "@/components/ui/icon";
import {
  clearSearchHistory,
  matchingHistory,
  searchHistory$,
} from "@/features/manga/state/search-history";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { SearchSuggestionsProps } from "./search-suggestions";
import { SuggestionsOverlay } from "./suggestions-overlay";

/** Search the draft first, then the matching recent searches. */
export function SearchSuggestions({
  draft$,
  onSubmit,
}: SearchSuggestionsProps) {
  const draft = useValue(draft$).trim();
  const recent = matchingHistory(useValue(searchHistory$), draft);
  const m3 = useThemeM3Colors();
  const headerHeight = useHeaderHeight();

  return (
    <SuggestionsOverlay
      style={{ top: headerHeight, backgroundColor: m3.background }}
    >
      <Host className="flex-1">
        <LazyColumn
          modifiers={[fillMaxSize()]}
          contentPadding={{
            start: GUTTER,
            end: GUTTER,
            top: 12,
            bottom: GUTTER,
          }}
        >
          <SegmentedListItem
            index={0}
            count={1}
            colors={{ containerColor: m3.surfaceContainerLow }}
            onPress={() => onSubmit(draft)}
          >
            <SegmentedListItem.Leading>
              <Icon name={Icons.search} muted />
            </SegmentedListItem.Leading>
            <Text maxLines={1} overflow="ellipsis">
              Search “{draft}”
            </Text>
            <SegmentedListItem.Supporting>
              <Text style={{ typography: "bodyMedium" }}>On AniList</Text>
            </SegmentedListItem.Supporting>
          </SegmentedListItem>
          {recent.length > 0 && (
            <Column verticalArrangement={{ spacedBy: SEGMENTED_GAP }}>
              <Row
                verticalAlignment="center"
                modifiers={[padding(4, 16, 0, 4)]}
              >
                <Text
                  style={{ typography: "titleSmall" }}
                  color={m3.primary}
                  modifiers={[weight(1)]}
                >
                  Recent
                </Text>
                <TextButton onClick={clearSearchHistory}>
                  <Text style={{ typography: "labelLarge" }}>Clear</Text>
                </TextButton>
              </Row>
              {recent.map((q, i) => (
                <SegmentedListItem
                  key={q}
                  index={i}
                  count={recent.length}
                  colors={{ containerColor: m3.surfaceContainerLow }}
                  onPress={() => onSubmit(q)}
                >
                  <SegmentedListItem.Leading>
                    <Icon name={Icons.history} muted />
                  </SegmentedListItem.Leading>
                  <Text maxLines={1} overflow="ellipsis">
                    {q}
                  </Text>
                </SegmentedListItem>
              ))}
            </Column>
          )}
        </LazyColumn>
      </Host>
    </SuggestionsOverlay>
  );
}
