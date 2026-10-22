import {
  Box,
  Column,
  FilledTonalIconButton,
  HorizontalDivider,
  IconButton,
  LazyColumn,
  Row,
  Spacer,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  height,
  padding,
  selectableGroup,
  semantics,
  verticalScroll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { Computed } from "@legendapp/state/react";
import { useState } from "react";
import { EmptyState } from "@/components/blocks/empty-state";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { SearchBar } from "@/components/ui/search-bar";
import { isScanBusy, scanningAll$ } from "@/features/manga/state/probes";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { AvailableItem } from "../available-item";
import { ExcludedItem } from "../excluded-item";
import { useSourceActions } from "../hooks/use-source-actions";
import { useSources } from "../hooks/use-sources";
import { useTitleMode } from "../hooks/use-title-mode";
import { RefreshIcon } from "../refresh-icon";
import { excludedMenuItems } from "../utils/row-content";
import { sheetItemKey, sheetItems } from "../utils/sheet-items";
import type { SheetContentProps } from "./sheet-content";

const EMPTY_HEIGHT = 320;

/** The menu hands its trigger an `onPress` to open it. */
function MoreButton({ onPress }: { onPress?: () => void }) {
  return (
    <IconButton
      onClick={onPress}
      modifiers={[
        semantics({ contentDescription: "Excluded sources actions" }),
      ]}
    >
      <Icon name={Icons.more} size={BUTTON_ICON_SIZE} color="inherit" />
    </IconButton>
  );
}

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
  const SearchTitlesButton = title.searching
    ? FilledTonalIconButton
    : IconButton;
  const [menuId, setMenuId] = useState<string | null>(null);
  const m3 = useThemeM3Colors();

  const items = sheetItems(available, excluded);

  const header = (id: "available" | "no-sources" | "excluded") =>
    id === "no-sources" ? (
      <Text
        style={{ typography: "bodyMedium" }}
        color={m3.onSurfaceVariant}
        modifiers={[padding(GUTTER, 8, GUTTER, 8)]}
      >
        No sources
      </Text>
    ) : id === "available" ? (
      <Text
        style={{ typography: "titleSmall" }}
        color={m3.primary}
        modifiers={[padding(GUTTER, 8, GUTTER, 0)]}
      >
        Available
      </Text>
    ) : (
      <Row
        verticalAlignment="center"
        horizontalArrangement={{ spacedBy: 8 }}
        modifiers={[padding(GUTTER, 8, 4, 0)]}
      >
        <Text style={{ typography: "titleSmall" }} color={m3.primary}>
          Excluded
        </Text>
        <Badge>{excluded.length}</Badge>
        <Spacer modifiers={[weight(1)]} />
        <Computed>
          {() => {
            const items = excludedMenuItems(excluded, isScanBusy(key), actions);
            return (
              <Menu items={items}>
                <MoreButton />
              </Menu>
            );
          }}
        </Computed>
      </Row>
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
      <Column
        verticalArrangement={{ spacedBy: 16 }}
        modifiers={[padding(0, 0, 0, GUTTER)]}
      >
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
                <Badge>{available.length}</Badge>
              </Box>
              <Spacer modifiers={[weight(1)]} />
              {/* A toggle: tonal while title search is on. */}
              <Row>
                <SearchTitlesButton
                  onClick={() =>
                    // Excluded sources too: the right page may be on one dropped for no match.
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
                  {() => (
                    <IconButton
                      enabled={!isScanBusy(key)}
                      onClick={actions.scanAll}
                      modifiers={[
                        semantics({ contentDescription: "Scan all sources" }),
                      ]}
                    >
                      <RefreshIcon
                        spinning={scanningAll$[key].get() === true}
                      />
                    </IconButton>
                  )}
                </Computed>
              </Row>
            </Row>
            <Row
              verticalAlignment="center"
              horizontalArrangement={{ spacedBy: 6 }}
            >
              <Text
                style={{ typography: "bodyMedium" }}
                color={m3.onSurfaceVariant}
              >
                {read > 0 ? "Read" : "Not started"}
              </Text>
              {read > 0 && <Badge>c.{read}</Badge>}
            </Row>
          </Column>
          {title.searching ? (
            <SearchBar
              key="titles"
              defaultValue={title.query}
              onSubmit={title.submit}
              placeholder="Title to search"
              shape="pill"
            />
          ) : (
            <SearchBar
              defaultValue={query}
              debounce={150}
              onDebouncedChange={setQuery}
              placeholder="Search sources..."
              shape="pill"
            />
          )}
        </Column>

        {items.length === 0 ? (
          // A fixed height, not the sheet's: centred in the full sheet it sits below the half snap.
          <Box modifiers={[fillMaxWidth(), height(EMPTY_HEIGHT)]}>
            {/* Scrolls inside the box, so the description variant never clips silently. */}
            <EmptyState {...empty} modifiers={[verticalScroll()]} />
          </Box>
        ) : (
          // One flat lazy list; the group gives TalkBack the radios' collection, as the old Column did.
          <LazyColumn
            modifiers={[fillMaxWidth(), weight(1), selectableGroup()]}
          >
            <LazyColumn.Items data={items} keyExtractor={sheetItemKey}>
              {({ item }) =>
                item.kind === "header" ? (
                  header(item.id)
                ) : (
                  <Column>
                    {!item.first && (
                      <HorizontalDivider
                        modifiers={[padding(GUTTER, 0, GUTTER, 0)]}
                      />
                    )}
                    {item.kind === "available" ? (
                      <AvailableItem
                        source={item.row.source}
                        mangaKey={key}
                        sources={all}
                        read={read}
                        openedAt={openedAt}
                        selected={item.row.source.id === selectedId}
                        menuOpen={menuId === item.row.source.id}
                        actions={actions}
                        onSelect={onSelect}
                        onMenu={setMenuId}
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
                  </Column>
                )
              }
            </LazyColumn.Items>
          </LazyColumn>
        )}
      </Column>
    </BottomSheet>
  );
}
