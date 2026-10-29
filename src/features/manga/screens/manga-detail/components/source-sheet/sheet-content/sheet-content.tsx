import { Computed } from "@legendapp/state/react";
import { Typography } from "panelui-native/components/typography";
import { cn } from "panelui-native/utils/cn";
import { Button } from "panelui-web/button";
import { ButtonGroup } from "panelui-web/button-group";
import { Input } from "panelui-web/input";
import { Sheet } from "panelui-web/sheet";
import { View } from "react-native";
import { LinearTransition } from "react-native-reanimated";
import { EmptyState } from "@/components/blocks/empty-state";
import { LegendList } from "@/components/layout/legend-list";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { isScanBusy, scanningAll$ } from "@/features/manga/state/probes";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { AvailableItem } from "../available-item";
import { ExcludedItem } from "../excluded-item";
import { useSourceActions } from "../hooks/use-source-actions";
import { useSources } from "../hooks/use-sources";
import { useTitleMode } from "../hooks/use-title-mode";
import { excludedMenuItems } from "../utils/row-content";
import { type SheetItem, sheetItemKey, sheetItems } from "../utils/sheet-items";
import { titleMenuItems } from "../utils/title-menu";

// Frame.Section's title, as in the extension list.
const SECTION_TITLE =
  "px-4 pt-2.5 pb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wider";
// An empty field shows its placeholder: nothing to clear.
const HIDDEN_WHEN_EMPTY = "group-has-[input:placeholder-shown]/input:hidden";

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
  const title = useTitleMode(manga.id, key);
  const searchSources = useDebouncedCallback(setQuery, 150);
  const installed = all.length > 0;

  // Both sections in one list, so they scroll together (both empty: none, and the empty state shows).
  const items = sheetItems(available, excluded);
  const selectedAt = items.findIndex(
    (item) => item.kind === "available" && item.row.source.id === selectedId,
  );

  const renderHeader = (id: "available" | "no-sources" | "excluded") =>
    id === "available" ? (
      <p className={SECTION_TITLE}>{`Available · ${available.length}`}</p>
    ) : id === "no-sources" ? (
      <Typography type="body-sm" muted className="px-4">
        No sources
      </Typography>
    ) : (
      <div className="flex items-center pe-4 pt-4">
        <p className={cn(SECTION_TITLE, "flex-1")}>
          {`Excluded · ${excluded.length}`}
        </p>
        <Computed>
          {() => {
            const items = excludedMenuItems(excluded, isScanBusy(key), actions);
            return (
              <Menu items={items}>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Excluded sources actions"
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
      </div>
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
        {/* px-4 lines the header up with the rows. */}
        <Sheet.Header className="px-4 pb-0">
          <div className="flex items-center gap-2">
            <Sheet.Title>Sources</Sheet.Title>
            <Badge>{available.length}</Badge>
            {/* A toggle: filled while title search is on. */}
            <ButtonGroup aria-label="Sources actions" className="ms-auto">
              <Button
                variant={title.searching ? "default" : "ghost"}
                size="icon"
                disabled={!installed}
                aria-pressed={title.searching}
                onClick={() =>
                  // Excluded sources too: the right page may be on one dropped for no match.
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
                  className={
                    title.searching
                      ? "text-primary-foreground"
                      : "text-foreground"
                  }
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
          </div>
          <Sheet.Description>
            {read > 0 ? (
              <>
                {/* A <span>, not a Badge: a <p> can't hold the Badge's <div>. */}
                Read{" "}
                <span className="rounded-full bg-secondary px-1.5 py-0.5 font-medium text-foreground text-xs">
                  c.{read}
                </span>
              </>
            ) : (
              "Not started"
            )}
          </Sheet.Description>
        </Sheet.Header>
        <div className="px-4">
          {title.searching ? (
            // A form, so Enter searches every source for the title.
            <form
              key={title.fieldKey}
              onSubmit={(event) => {
                event.preventDefault();
                title.submit(
                  new FormData(event.currentTarget).get("title") as string,
                );
              }}
            >
              <Input.Group>
                <Input.Addon>
                  <Icon name={Icons.search} size={BUTTON_ICON_SIZE} muted />
                </Input.Addon>
                <Input
                  type="search"
                  name="title"
                  spellCheck={false}
                  aria-label="Title to search"
                  placeholder="Title to search"
                  defaultValue={title.query}
                  onChange={(event) => title.type(event.target.value)}
                />
                <Input.Addon align="end">
                  <ClearButton onClear={() => title.type("")} />
                  {/* The check follows the field: an edit unchecks the title. */}
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
                          aria-label="AniList titles"
                        >
                          <Icon name={Icons.swap} size={BUTTON_ICON_SIZE} />
                        </Button>
                      </Menu>
                    )}
                  </Computed>
                </Input.Addon>
              </Input.Group>
            </form>
          ) : (
            <Input.Group>
              <Input.Addon>
                <Icon name={Icons.search} size={BUTTON_ICON_SIZE} muted />
              </Input.Addon>
              <Input
                type="search"
                aria-label="Search sources"
                placeholder="Search sources..."
                defaultValue={query}
                onChange={(event) => searchSources.run(event.target.value)}
              />
              <Input.Addon align="end" className={HIDDEN_WHEN_EMPTY}>
                <ClearButton
                  onClear={() => {
                    searchSources.cancel();
                    setQuery("");
                  }}
                />
              </Input.Addon>
            </Input.Group>
          )}
        </div>

        <LegendList
          itemLayoutAnimation={LinearTransition}
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
                {!item.first && <hr className="mx-4" />}
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

/** Empties the field in its `Input.Group`, which keeps focus. */
function ClearButton({ onClear }: { onClear: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Clear"
      className={HIDDEN_WHEN_EMPTY}
      onClick={(event) => {
        const input = event.currentTarget
          .closest("[data-slot=input-group]")
          ?.querySelector("input");
        if (!input) return;
        input.value = "";
        input.focus();
        onClear();
      }}
    >
      <Icon name={Icons.close} size={BUTTON_ICON_SIZE} muted />
    </Button>
  );
}
