import { View } from "react-native";
import { EmptyState } from "@/components/blocks/empty-state";
import { LegendList } from "@/components/layout/legend-list";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Item } from "@/components/ui/item";
import { SearchBar } from "@/components/ui/search-bar";
import { Typography } from "@/components/ui/typography";
import { SourceTile } from "@/features/manga/components/source-tile";
import { sourceColor } from "@/features/manga/utils/source";
import { useSources } from "./hooks/use-sources";

export interface SourceSheetProps {
  isPresented: boolean;
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
  selectedId,
  onSelect,
  onDismiss,
}: SourceSheetProps) {
  const { query, setQuery, mode, sources, selected, selectedIndex, empty } =
    useSources(selectedId);

  return (
    <BottomSheet
      isPresented={isPresented}
      onDismiss={onDismiss}
      contentKey={`${sources.length}`}
      snapPoints={["half", "full"]}
      snapPointsDirection="bottom"
    >
      <View className="flex-1 gap-4 py-4">
        <View className="gap-4 px-4">
          <View className="flex-row items-center gap-2">
            <Typography type="h4">Sources</Typography>
            <Badge>{sources.length}</Badge>
            <View className="flex-1" />
            {selected && (
              <View className="shrink flex-row items-center gap-1">
                <Icon name={Icons.check} size={14} className="text-primary" />
                <Typography
                  type="small"
                  muted
                  numberOfLines={1}
                  className="shrink"
                >
                  {selected.name}
                </Typography>
              </View>
            )}
          </View>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search sources..."
            shape="pill"
          />
        </View>

        <LegendList
          data={sources}
          keyExtractor={(source) => source.id}
          extraData={selectedId}
          // Read once, when the sheet opens; typing doesn't move it.
          initialScrollIndex={
            selectedIndex > 0
              ? { index: selectedIndex, viewPosition: 0.5 }
              : undefined
          }
          ListEmptyComponent={<EmptyState {...empty} />}
          renderItem={({ item: source, index }) => (
            <>
              {index > 0 && <Item.Separator className="mx-4" />}
              <Item onPress={() => onSelect(source.id)}>
                <SourceTile
                  initials={source.initials}
                  iconUrl={source.iconUrl}
                  color={sourceColor(source, mode)}
                />
                <Item.Content>
                  <Item.Title>{source.name}</Item.Title>
                </Item.Content>
                {source.id === selectedId && (
                  <Item.Actions>
                    <Icon
                      name={Icons.check}
                      size={BUTTON_ICON_SIZE}
                      className="text-primary"
                    />
                  </Item.Actions>
                )}
              </Item>
            </>
          )}
        />
      </View>
    </BottomSheet>
  );
}
