import {
  Box,
  Column,
  HorizontalDivider,
  ListItem,
  Row,
  Spacer,
} from "@expo/ui/jetpack-compose";
import {
  background,
  clickable,
  clip,
  fillMaxWidth,
  padding,
  paddingAll,
  Shapes,
  size,
  verticalScroll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { Fragment } from "react";
import { useCSSVariable } from "uniwind";
import { EmptyState } from "@/components/empty-state";
import { Code, Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Icon, Icons } from "@/components/ui/icon";
import { SearchBar } from "@/components/ui/search-bar";
import { sourceColor } from "@/features/manga/sources";
import { useThemeColor } from "@/hooks/use-theme-color";
import { dp } from "@/utils/utils";
import type { SourceSheetProps } from "./source-sheet";
import { useSources } from "./use-sources";

/** The initials tile's side, in dp. */
const TILE = 40;

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
  const border = useThemeColor("border");
  // Each theme family sets its own rounding, so `rounded-lg` is read, not fixed.
  const radius = dp(useCSSVariable("--radius-lg") as string | number) ?? 8;

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
                    <Box
                      contentAlignment="center"
                      modifiers={[
                        size(TILE, TILE),
                        clip(Shapes.RoundedCorner(radius)),
                        // Compose's `border()` takes no shape, so the rounded
                        // border is its color showing through a hairline gap.
                        background(border),
                        paddingAll(1),
                        clip(Shapes.RoundedCorner(radius - 1)),
                        background(sourceColor(source, mode)),
                      ]}
                    >
                      <Text
                        style={{ typography: "bodySmall", fontWeight: "600" }}
                      >
                        {source.initials}
                      </Text>
                    </Box>
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
