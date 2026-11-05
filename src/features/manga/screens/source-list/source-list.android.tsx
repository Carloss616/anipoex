import {
  Box,
  Column,
  FilledIconButton,
  FilledTonalIconButton,
  IconButton,
  LazyColumn,
  Row,
  Spacer,
} from "@expo/ui/jetpack-compose";
import {
  align,
  background,
  clip,
  fillMaxSize,
  fillMaxWidth,
  height,
  padding,
  Shapes,
  selectableGroup,
  semantics,
  size,
  verticalScroll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { Computed } from "@legendapp/state/react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/blocks/empty-state";
import { GUTTER } from "@/components/native/constants";
import { nestedScrollInteropConnection } from "@/components/native/jetpack-compose/nested-scroll-interop-connection";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { Host } from "@/components/ui/host";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { Menu } from "@/components/ui/menu";
import { Progress } from "@/components/ui/progress";
import { SearchBar } from "@/components/ui/search-bar";
import {
  isScanBusy,
  scanningAll$,
  scanProgress$,
} from "@/features/manga/state/probes";
import { isTitleSearching } from "@/features/manga/state/title-search";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { AvailableItem } from "./components/available-item";
import { ExcludedItem } from "./components/excluded-item";
import { SectionHeader } from "./components/section-header";
import { useSourceActions } from "./hooks/use-source-actions";
import { useSourceList } from "./hooks/use-source-list";
import { useSources } from "./hooks/use-sources";
import { useTitleMode } from "./hooks/use-title-mode";
import type { ListBodyProps } from "./source-list";
import { excludedMenuItems } from "./utils/row-content";
import { sheetItemKey, sheetItems } from "./utils/sheet-items";
import { titleMenuItems } from "./utils/title-menu";

const EMPTY_HEIGHT = 320;

function TitlesButton({ onPress }: { onPress?: () => void }) {
  return (
    <IconButton
      onClick={onPress}
      modifiers={[semantics({ contentDescription: "AniList titles" })]}
    >
      <Icon name={Icons.swap} size={BUTTON_ICON_SIZE} color="inherit" />
    </IconButton>
  );
}

export function SourceList() {
  const { manga, read, selectedId, pick, close } = useSourceList();

  if (!manga) return null;
  return (
    <ListBody
      manga={manga}
      read={read}
      selectedId={selectedId}
      onSelect={(id) => {
        close();
        pick(id);
      }}
    />
  );
}

function ListBody({ manga, read, selectedId, onSelect }: ListBodyProps) {
  const { key, all, query, setQuery, available, excluded, empty, openedAt } =
    useSources({ mangaId: manga.id });
  const actions = useSourceActions({ manga, read, selectedId });
  // In the body, not the list's callback, so the Compiler keeps it stable.
  const excludedMenu = () =>
    excludedMenuItems(
      excluded,
      isScanBusy(key),
      isTitleSearching(
        key,
        excluded.map((row) => row.source.id),
      ),
      actions,
    );
  const title = useTitleMode(manga.id, key);
  // A toggle: filled while title search is on.
  const SearchTitlesButton = title.searching
    ? FilledIconButton
    : FilledTonalIconButton;
  const reading = all.find((source) => source.id === selectedId);
  const m3 = useThemeM3Colors();
  const insets = useSafeAreaInsets();

  const items = sheetItems(available, excluded);

  return (
    <Host className="flex-1">
      <Column
        verticalArrangement={{ spacedBy: 16 }}
        modifiers={[
          fillMaxSize(),
          nestedScrollInteropConnection(),
          padding(insets.left, 0, insets.right, GUTTER),
        ]}
      >
        {/* M3's drag handle, as the other sheets draw it; 6 + the gap is 22. */}
        <Box
          modifiers={[
            align("centerHorizontally"),
            padding(0, 22, 0, 6),
            size(32, 4),
            clip(Shapes.RoundedCorner(2)),
            background(m3.onSurfaceVariant),
          ]}
        />
        <Column
          verticalArrangement={{ spacedBy: 16 }}
          modifiers={[padding(GUTTER, 0, GUTTER, 0)]}
        >
          <Column>
            <Row
              verticalAlignment="center"
              horizontalArrangement={{ spacedBy: 8 }}
            >
              <Text style={{ typography: "titleLarge" }}>Sources</Text>
              {/* M3's badge reads high against a centered title. */}
              <Box modifiers={[padding(0, 4, 0, 0)]}>
                <Badge>{available.length + excluded.length}</Badge>
              </Box>
              <Spacer modifiers={[weight(1)]} />
              <Row horizontalArrangement={{ spacedBy: 8 }}>
                <SearchTitlesButton
                  onClick={() =>
                    // Excluded too: the right page may be on one dropped for
                    // no match.
                    actions.searchAll(
                      [...available, ...excluded].map((row) => row.source.id),
                    )
                  }
                  modifiers={[
                    semantics({
                      contentDescription: "Search titles in all sources",
                    }),
                  ]}
                >
                  <Icon
                    name={
                      title.searching
                        ? Icons.searchTitlesOff
                        : Icons.searchTitles
                    }
                    size={BUTTON_ICON_SIZE}
                    color="inherit"
                  />
                </SearchTitlesButton>
                <Computed>
                  {() => {
                    const scanning = scanningAll$[key].get() === true;

                    return (
                      <FilledTonalIconButton
                        enabled={!scanning}
                        onClick={actions.scanAll}
                        modifiers={[
                          semantics({ contentDescription: "Scan all sources" }),
                        ]}
                      >
                        {scanning ? (
                          <Loader size="sm" />
                        ) : (
                          <Icon
                            name={Icons.refresh}
                            size={BUTTON_ICON_SIZE}
                            color="inherit"
                          />
                        )}
                      </FilledTonalIconButton>
                    );
                  }}
                </Computed>
              </Row>
            </Row>
            <Computed>
              {() => {
                const progress = scanProgress$[key].get();

                return progress ? (
                  <Column
                    verticalArrangement={{ spacedBy: 8 }}
                    modifiers={[padding(0, 4, 0, 0)]}
                  >
                    <Text
                      style={{ typography: "bodyMedium" }}
                      color={m3.onSurfaceVariant}
                    >
                      {`Scanning ${progress.done} of ${progress.total}`}
                    </Text>
                    <Progress value={progress.done} maxValue={progress.total} />
                  </Column>
                ) : (
                  <Row
                    verticalAlignment="center"
                    horizontalArrangement={{ spacedBy: 6 }}
                  >
                    <Text
                      style={{ typography: "bodyMedium" }}
                      color={m3.onSurfaceVariant}
                      maxLines={1}
                      overflow="ellipsis"
                    >
                      {reading
                        ? `Reading on ${reading.baseName ?? reading.name}`
                        : read > 0
                          ? "Read"
                          : "Not started"}
                    </Text>
                    {read > 0 && <Badge>c.{read}</Badge>}
                  </Row>
                );
              }}
            </Computed>
          </Column>
          {title.searching ? (
            <SearchBar
              key={title.fieldKey}
              defaultValue={title.query}
              onChangeText={title.type}
              onSubmit={title.submit}
              placeholder="Title to search"
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
                      <TitlesButton />
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
              placeholder="Search sources"
            />
          )}
        </Column>

        {items.length === 0 ? (
          // A fixed height: centred in the full sheet, it sits below the
          // half snap.
          <Box modifiers={[fillMaxWidth(), height(EMPTY_HEIGHT)]}>
            {/* Scrolls inside the box, so the description variant never
                clips silently. */}
            <EmptyState {...empty} modifiers={[verticalScroll()]} />
          </Box>
        ) : (
          // One lazy list; the group gives TalkBack the radios' collection.
          <LazyColumn
            modifiers={[fillMaxWidth(), weight(1), selectableGroup()]}
          >
            {/* Keyed by source: a scan reorders rows while a menu may be open. */}
            <LazyColumn.Items
              data={items}
              keyExtractor={sheetItemKey}
              recycling={false}
            >
              {({ item }) =>
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
                  <Text
                    style={{ typography: "bodyMedium" }}
                    color={m3.onSurfaceVariant}
                    modifiers={[padding(GUTTER, 8, GUTTER, 8)]}
                  >
                    No sources
                  </Text>
                ) : item.kind === "available" ? (
                  <AvailableItem
                    source={item.row.source}
                    mangaKey={key}
                    sources={all}
                    read={read}
                    openedAt={openedAt}
                    selected={item.row.source.id === selectedId}
                    index={item.index}
                    count={item.count}
                    actions={actions}
                    onSelect={onSelect}
                  />
                ) : (
                  <ExcludedItem
                    source={item.row.source}
                    reason={item.row.reason}
                    pinned={item.row.pinned}
                    index={item.index}
                    count={item.count}
                    mangaKey={key}
                    actions={actions}
                  />
                )
              }
            </LazyColumn.Items>
          </LazyColumn>
        )}
      </Column>
    </Host>
  );
}
