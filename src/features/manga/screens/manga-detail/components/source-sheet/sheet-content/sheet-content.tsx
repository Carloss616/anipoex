import { Computed } from "@legendapp/state/react";
import { Typography } from "panelui-native/components/typography";
import { Button } from "panelui-web/button";
import { ButtonGroup } from "panelui-web/button-group";
import { Sheet } from "panelui-web/sheet";
import { View } from "react-native";
import { LinearTransition } from "react-native-reanimated";
import { EmptyState } from "@/components/blocks/empty-state";
import { LegendList } from "@/components/layout/legend-list";
import { Badge } from "@/components/ui/badge";
import { BottomSheet, SHEET_INSET } from "@/components/ui/bottom-sheet";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { SearchBar } from "@/components/ui/search-bar";
import { isScanBusy, scanningAll$ } from "@/features/manga/state/probes";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { AvailableItem } from "../available-item";
import { ExcludedItem } from "../excluded-item";
import { useSourceActions } from "../hooks/use-source-actions";
import { useSources } from "../hooks/use-sources";
import { useTitleMode } from "../hooks/use-title-mode";
import { SectionHeader } from "../section-header";
import { excludedMenuItems } from "../utils/row-content";
import { type SheetItem, sheetItemKey, sheetItems } from "../utils/sheet-items";
import { titleMenuItems } from "../utils/title-menu";

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
  // In the body, not the list's callback, so the Compiler keeps it stable.
  const excludedMenu = () =>
    excludedMenuItems(excluded, isScanBusy(key), actions);
  const title = useTitleMode(manga.id, key);
  const installed = all.length > 0;

  // One list, so both sections scroll together; both empty shows the empty state.
  const items = sheetItems(available, excluded);
  const stickyIndices = items.flatMap((item, i) =>
    item.kind === "header" ? [i] : [],
  );
  const selectedAt = items.findIndex(
    (item) => item.kind === "available" && item.row.source.id === selectedId,
  );

  return (
    <BottomSheet
      isPresented={isPresented}
      onDismiss={onDismiss}
      expanded={title.searching}
      contentKey={`${available.length}-${excluded.length}`}
      snapPoints={["half", "full"]}
      snapPointsDirection="bottom"
    >
      <View className="flex-1 gap-4 pb-4">
        <Sheet.Header className={SHEET_INSET.header}>
          <View className="flex-row items-center gap-2">
            <View>
              <Sheet.Title>
                Sources <Badge>{available.length + excluded.length}</Badge>
              </Sheet.Title>
              <Sheet.Description>
                {read > 0 ? (
                  <>
                    Read <Badge>c.{read}</Badge>
                  </>
                ) : (
                  "Not started"
                )}
              </Sheet.Description>
            </View>
            <ButtonGroup
              aria-label="Sources actions"
              className="glass-chrome ms-auto rounded-full! border **:rounded-full!"
            >
              <Button
                variant={title.searching ? "default" : "ghost"}
                size="icon"
                disabled={!installed}
                aria-pressed={title.searching}
                onClick={() =>
                  actions.searchAll(
                    [...available, ...excluded].map((row) => row.source.id),
                  )
                }
                aria-label="Search titles in all sources"
              >
                <Icon
                  name={
                    title.searching ? Icons.searchTitlesOff : Icons.searchTitles
                  }
                  size={BUTTON_ICON_SIZE}
                />
              </Button>
              <Computed>
                {() => {
                  const scanning = scanningAll$[key].get() === true;
                  return (
                    <Button
                      variant="ghost"
                      size="icon"
                      // A plain browser has no sources, so nothing to scan.
                      disabled={!installed}
                      loading={scanning}
                      onClick={actions.scanAll}
                      aria-label="Scan all sources"
                    >
                      <Icon name={Icons.refresh} size={BUTTON_ICON_SIZE} />
                    </Button>
                  );
                }}
              </Computed>
            </ButtonGroup>
          </View>
        </Sheet.Header>

        <View className="px-4">
          {title.searching ? (
            <SearchBar
              key={title.fieldKey}
              defaultValue={title.query}
              onChangeText={title.type}
              onSubmit={title.submit}
              placeholder="Title to search"
              spellCheck={false}
              accessory={
                // The check follows the field: an edit unchecks the title.
                <Computed>
                  {() => (
                    <Menu
                      items={titleMenuItems(
                        manga,
                        title.fieldText(),
                        title.pick,
                      )}
                    >
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        shape="pill"
                        aria-label="AniList titles"
                      >
                        <Icon name={Icons.swap} size={BUTTON_ICON_SIZE} />
                      </Button>
                    </Menu>
                  )}
                </Computed>
              }
            />
          ) : (
            <SearchBar
              defaultValue={query}
              debounce={150}
              onDebouncedChange={setQuery}
              placeholder="Search sources..."
            />
          )}
        </View>

        <LegendList
          itemLayoutAnimation={LinearTransition}
          data={items}
          keyExtractor={sheetItemKey}
          getItemType={(item: SheetItem) => item.kind}
          extraData={selectedId}
          stickyHeaderIndices={stickyIndices}
          // Read once on open, so typing doesn't scroll; the first rows need none.
          initialScrollIndex={
            selectedAt > 1
              ? { index: selectedAt, viewPosition: 0.5 }
              : undefined
          }
          ListEmptyComponent={<EmptyState {...empty} />}
          renderItem={({ item }) =>
            item.kind === "header" ? (
              item.id === "available" ? (
                <SectionHeader title="Available" count={available.length} />
              ) : (
                <SectionHeader
                  title="Excluded"
                  count={excluded.length}
                  menu={excludedMenu}
                />
              )
            ) : item.kind === "no-sources" ? (
              <Typography type="body-sm" muted className="px-4">
                No sources
              </Typography>
            ) : (
              <>
                {!item.first && (
                  <View role="separator" className="mx-4 h-px bg-border" />
                )}
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
