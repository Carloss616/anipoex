import {
  Box,
  Column,
  HorizontalDivider,
  ListItem,
  RadioButton,
  Row,
  Spacer,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  padding,
  selectable,
  selectableGroup,
  verticalScroll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { EmptyState } from "@/components/blocks/empty-state";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Icon, Icons } from "@/components/ui/icon";
import { SearchBar } from "@/components/ui/search-bar";
import { SourceTile } from "@/features/manga/components/source-tile";
import { sourceColor } from "@/features/manga/sources";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { useSources } from "./hooks/use-sources";
import type { SourceSheetProps } from "./source-sheet";

export function SourceSheet({
  isPresented,
  selectedId,
  onSelect,
  onDismiss,
}: SourceSheetProps) {
  const { query, setQuery, mode, sources, selected } = useSources(selectedId);
  const m3 = useThemeM3Colors();

  return (
    <BottomSheet
      isPresented={isPresented}
      onDismiss={onDismiss}
      contentKey={`${sources.length}`}
      snapPoints={["half", "full"]}
      snapPointsDirection="bottom"
    >
      <Column
        verticalArrangement={{ spacedBy: 16 }}
        modifiers={[padding(0, 0, 0, 16)]}
      >
        <Column
          verticalArrangement={{ spacedBy: 16 }}
          modifiers={[padding(16, 0, 16, 0)]}
        >
          <Row
            verticalAlignment="center"
            horizontalArrangement={{ spacedBy: 8 }}
          >
            <Text style={{ typography: "titleLarge" }}>Sources</Text>
            {/* M3's badge reads high against a centered title. */}
            <Box modifiers={[padding(0, 4, 0, 0)]}>
              <Badge>{sources.length}</Badge>
            </Box>
            <Spacer modifiers={[weight(1)]} />
            {selected && (
              <Row
                verticalAlignment="center"
                horizontalArrangement={{ spacedBy: 4 }}
              >
                <Icon name={Icons.check} size={16} color={m3.primary} />
                <Text
                  style={{ typography: "labelLarge" }}
                  color={m3.onSurfaceVariant}
                  maxLines={1}
                  overflow="ellipsis"
                >
                  {selected.name}
                </Text>
              </Row>
            )}
          </Row>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search sources..."
            shape="pill"
          />
        </Column>

        {sources.length === 0 ? (
          <EmptyState
            title="No sources found"
            modifiers={[fillMaxWidth(), weight(1), verticalScroll()]}
          />
        ) : (
          <Column
            modifiers={[
              fillMaxWidth(),
              weight(1),
              verticalScroll(),
              selectableGroup(),
            ]}
          >
            {sources.map((source, index) => (
              <Column key={source.id}>
                {index > 0 && (
                  <HorizontalDivider modifiers={[padding(16, 0, 16, 0)]} />
                )}
                <ListItem
                  colors={{ containerColor: "transparent" }}
                  modifiers={[
                    selectable(
                      source.id === selectedId,
                      () => onSelect(source.id),
                      "radioButton",
                    ),
                  ]}
                >
                  <ListItem.LeadingContent>
                    <SourceTile
                      initials={source.initials}
                      iconUrl={source.iconUrl}
                      color={sourceColor(source, mode)}
                    />
                  </ListItem.LeadingContent>
                  <ListItem.HeadlineContent>
                    <Text style={{ fontWeight: "500" }}>{source.name}</Text>
                  </ListItem.HeadlineContent>
                  <ListItem.TrailingContent>
                    <RadioButton selected={source.id === selectedId} />
                  </ListItem.TrailingContent>
                </ListItem>
              </Column>
            ))}
          </Column>
        )}
      </Column>
    </BottomSheet>
  );
}
