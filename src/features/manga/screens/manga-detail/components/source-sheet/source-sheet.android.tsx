import {
  Box,
  Column,
  HorizontalDivider,
  ListItem,
  Row,
  Spacer,
} from "@expo/ui/jetpack-compose";
import {
  clickable,
  fillMaxWidth,
  padding,
  verticalScroll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { Fragment } from "react";
import { EmptyState } from "@/components/empty-state";
import { Code, Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Icon, Icons } from "@/components/ui/icon";
import { SearchBar } from "@/components/ui/search-bar";
import { SourceTile } from "@/features/manga/components/source-tile";
import { sourceColor } from "@/features/manga/sources";
import type { SourceSheetProps } from "./source-sheet";
import { useSources } from "./use-sources";

export function SourceSheet({
  isPresented,
  entryId,
  total,
  selectedId,
  onSelect,
  onDismiss,
}: SourceSheetProps) {
  const { query, setQuery, mode, progress, sources } = useSources(
    entryId,
    selectedId,
  );

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
            {!!progress && (
              <Code>
                {progress}/{total ?? "_"}
              </Code>
            )}
          </Row>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search sources..."
            shape="pill"
          />
        </Column>

        <Column modifiers={[fillMaxWidth(), weight(1), verticalScroll()]}>
          {sources.length === 0 ? (
            <EmptyState title="No sources found" />
          ) : (
            sources.map((source, index) => (
              <Fragment key={source.id}>
                {index > 0 && (
                  <HorizontalDivider modifiers={[padding(16, 0, 16, 0)]} />
                )}
                <ListItem
                  colors={{ containerColor: "transparent" }}
                  modifiers={[clickable(() => onSelect(source.id))]}
                >
                  <ListItem.LeadingContent>
                    <SourceTile
                      initials={source.initials}
                      color={sourceColor(source, mode)}
                    />
                  </ListItem.LeadingContent>
                  <ListItem.HeadlineContent>
                    <Text style={{ fontWeight: "500" }}>{source.name}</Text>
                  </ListItem.HeadlineContent>
                  {source.id === selectedId && (
                    <ListItem.TrailingContent>
                      <Icon name={Icons.check} size={18} color="inherit" />
                    </ListItem.TrailingContent>
                  )}
                </ListItem>
              </Fragment>
            ))
          )}
        </Column>
      </Column>
    </BottomSheet>
  );
}
