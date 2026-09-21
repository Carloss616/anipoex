import { Spacer } from "@expo/ui";
import { Fragment, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { ScrollView } from "@/components/layout/scroll-view/scroll-view";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { SEMANTIC_COLOR } from "@/components/ui/colors";
import { Icon } from "@/components/ui/icon";
import { Item } from "@/components/ui/item";
import { SearchBar } from "@/components/ui/search-bar";
import { Typography } from "@/components/ui/typography";
import { useTrackingEntry } from "@/features/manga/hooks/use-tracking-entry";
import { MOCK_SOURCES } from "@/features/manga/sources";

export interface SourceSheetProps {
  isPresented: boolean;
  entryId: number | null | undefined;
  /** Chapter count, when AniList knows it. */
  total: number | null | undefined;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onDismiss: () => void;
}

/**
 * Which source the chapter list reads. A picker confirms by choosing, so it
 * carries no Save — the same way the tracking sheet's fields commit themselves.
 */
export function SourceSheet({
  isPresented,
  entryId,
  total,
  selectedId,
  onSelect,
  onDismiss,
}: SourceSheetProps) {
  const [query, setQuery] = useState("");
  const progress = useTrackingEntry(entryId)?.progress;

  const needle = query.trim().toLowerCase();
  const matches = needle
    ? MOCK_SOURCES.filter((source) =>
        source.name.toLowerCase().includes(needle),
      )
    : MOCK_SOURCES;

  const selected = matches.find((source) => source.id === selectedId);
  const sources = selected
    ? [selected, ...matches.filter((source) => source !== selected)]
    : matches;

  return (
    <BottomSheet
      isPresented={isPresented}
      onDismiss={onDismiss}
      contentKey={`${sources.length}`}
      snapPoints={["half", "full"]}
      snapPointsDirection="bottom"
    >
      <Column className="web:flex-1 gap-4 py-4 android:pt-0">
        <Column className="gap-4 px-4">
          <Row alignment="center" className="gap-2">
            <Typography type="h4">Sources</Typography>
            {/* M3's badge reads high; centered, this pads it 2dp down. */}
            <Column className="android:pt-1">
              <Badge>{sources.length}</Badge>
            </Column>
            <Spacer flexible />
            {!!progress && (
              <Typography.Code className="web:self-auto">
                {progress}/{total ?? "_"}
              </Typography.Code>
            )}
          </Row>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search sources..."
            shape="pill"
          />
        </Column>

        <ScrollView fill className="w-full">
          {sources.length === 0 ? (
            <EmptyState title="No sources found" />
          ) : (
            <Item.Group>
              {sources.map((source, index) => {
                const { className } = SEMANTIC_COLOR[source.color];
                return (
                  <Fragment key={source.id}>
                    {index > 0 && <Item.Separator className="mx-4" />}
                    <Item onPress={() => onSelect(source.id)}>
                      <Item.Media variant="icon" className={className.fill}>
                        <Typography
                          type="body-xs"
                          weight="semibold"
                          className={className.label}
                        >
                          {source.initials}
                        </Typography>
                      </Item.Media>
                      <Item.Content>
                        <Item.Title>{source.name}</Item.Title>
                      </Item.Content>
                      {source.id === selectedId && (
                        <Item.Actions>
                          <Icon
                            name={Icon.select({
                              ios: "checkmark",
                              android: require("@expo/material-symbols/check.xml"),
                              web: "check",
                            })}
                            size={18}
                          />
                        </Item.Actions>
                      )}
                    </Item>
                  </Fragment>
                );
              })}
            </Item.Group>
          )}
        </ScrollView>
      </Column>
    </BottomSheet>
  );
}
