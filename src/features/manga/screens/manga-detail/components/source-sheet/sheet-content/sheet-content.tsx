import { Computed } from "@legendapp/state/react";
import { View } from "react-native";
import { EmptyState } from "@/components/blocks/empty-state";
import { LegendList } from "@/components/layout/legend-list";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Item } from "@/components/ui/item";
import { Menu } from "@/components/ui/menu";
import { SearchBar } from "@/components/ui/search-bar";
import { Typography } from "@/components/ui/typography";
import { isScanBusy, scanningAll$ } from "@/features/manga/state/probes";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { AvailableItem } from "../available-item";
import { ExcludedItem } from "../excluded-item";
import { useSourceActions } from "../hooks/use-source-actions";
import { useSources } from "../hooks/use-sources";
import { RefreshIcon } from "../refresh-icon";
import { excludedMenuItems } from "../utils/row-content";
import { type SheetItem, sheetItemKey, sheetItems } from "../utils/sheet-items";

export interface SheetContentProps {
  manga: Pick<MangaDetail, "id" | "title" | "synonyms">;
  read: number;
  isPresented: boolean;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onDismiss: () => void;
}

/** The sheet itself, drawn per platform; `SourceSheet` wires it to the picker. */
export function SheetContent({
  manga,
  read,
  isPresented,
  selectedId,
  onSelect,
  onDismiss,
}: SheetContentProps) {
  const { key, all, query, setQuery, available, excluded, empty, openedAt } =
    useSources({ mangaId: manga.id, isPresented });
  const actions = useSourceActions({ manga, read, selectedId });
  const installed = all.length > 0;

  // Both sections in one list, so they scroll together (both empty: none, and the empty state shows).
  const items = sheetItems(available, excluded);
  const selectedAt = items.findIndex(
    (item) => item.kind === "available" && item.row.source.id === selectedId,
  );

  const renderHeader = (id: "available" | "no-sources" | "excluded") =>
    id === "available" ? (
      <Typography type="small" className="px-4 text-primary">
        Available
      </Typography>
    ) : id === "no-sources" ? (
      <Typography type="body-sm" muted className="px-4">
        No sources
      </Typography>
    ) : (
      <View className="flex-row items-center gap-2 px-4 pt-4">
        <Typography type="small" className="text-primary">
          Excluded
        </Typography>
        <Badge>{excluded.length}</Badge>
        <View className="flex-1" />
        <Computed>
          {() => {
            const items = excludedMenuItems(excluded, isScanBusy(key), actions);
            return (
              <Menu items={items}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9"
                  accessibilityLabel="Excluded sources actions"
                >
                  <Icon
                    name={Icons.more}
                    size={BUTTON_ICON_SIZE}
                    className="text-foreground"
                  />
                </Button>
              </Menu>
            );
          }}
        </Computed>
      </View>
    );

  return (
    <BottomSheet
      isPresented={isPresented}
      onDismiss={onDismiss}
      contentKey={`${available.length}-${excluded.length}`}
      snapPoints={["half", "full"]}
      snapPointsDirection="bottom"
    >
      <View className="flex-1 gap-4 py-4">
        <View className="gap-4 px-4">
          <View>
            <View className="flex-row items-center gap-2">
              <Typography type="h4">Sources</Typography>
              <Badge>{available.length}</Badge>
              <View className="flex-1" />
              <Computed>
                {() => (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9"
                    // A plain browser has no sources, so nothing to scan.
                    disabled={isScanBusy(key) || !installed}
                    onPress={actions.scanAll}
                    accessibilityLabel="Scan all sources"
                  >
                    <RefreshIcon spinning={scanningAll$[key].get() === true} />
                  </Button>
                )}
              </Computed>
            </View>
            <Typography type="body-sm" muted>
              {read > 0 ? `Read c.${read}` : "Not started"}
            </Typography>
          </View>
          <SearchBar
            defaultValue={query}
            debounce={150}
            onDebouncedChange={setQuery}
            placeholder="Search sources..."
            shape="pill"
          />
        </View>

        <LegendList
          data={items}
          keyExtractor={sheetItemKey}
          getItemType={(item: SheetItem) => item.kind}
          extraData={selectedId}
          // Read once, when the sheet opens; typing doesn't move it. No scroll when the selected row is the first one.
          initialScrollIndex={
            selectedAt > 1
              ? { index: selectedAt, viewPosition: 0.5 }
              : undefined
          }
          ListEmptyComponent={<EmptyState {...empty} />}
          renderItem={({ item }) =>
            item.kind === "header" ? (
              renderHeader(item.id)
            ) : (
              <>
                {!item.first && <Item.Separator className="mx-4" />}
                {item.kind === "available" ? (
                  <AvailableItem
                    source={item.row.source}
                    mangaKey={key}
                    sources={all}
                    read={read}
                    openedAt={openedAt}
                    selected={item.row.source.id === selectedId}
                    actions={actions}
                    onSelect={onSelect}
                  />
                ) : (
                  <ExcludedItem
                    source={item.row.source}
                    reason={item.row.reason}
                    pinned={item.row.pinned}
                    mangaKey={key}
                    actions={actions}
                  />
                )}
              </>
            )
          }
        />
      </View>
    </BottomSheet>
  );
}
